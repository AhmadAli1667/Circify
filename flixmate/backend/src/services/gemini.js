import { GoogleGenAI } from '@google/genai'
import tmdbFetch from './tmdb.js'

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Google's current free-tier flash model as of Aug 2026. If this 404s,
// check the model id in Google AI Studio, naming churns every few weeks.
const MODEL = 'gemini-3.7-flash'
const MAX_TOOL_ROUNDS = 4

const searchMoviesTool = {
  type: 'function',
  name: 'search_movies',
  description:
    'Find real movies from TMDb matching a vibe. Always call this before recommending anything, ' +
    'never invent a title from memory. Combine genres and/or keyword_ids (reuse ids from the taste ' +
    'profile above when they fit) and/or a free-text query for a specific title/actor/franchise.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Free-text title/topic search, e.g. an actor, franchise, or specific film the user named.'
      },
      genres: {
        type: 'array',
        items: { type: 'string' },
        description: 'TMDb genre names, e.g. ["Thriller", "Science Fiction"].'
      },
      keyword_ids: {
        type: 'array',
        items: { type: 'number' },
        description: 'TMDb keyword ids to match against, typically drawn from the taste profile.'
      },
      min_rating: { type: 'number', description: 'Minimum TMDb vote average, 0 to 10.' }
    },
    required: []
  }
}

const respondTool = {
  type: 'function',
  name: 'respond',
  description: 'Finalize your turn. Call this exactly once you are ready to reply, whether or not you have picks.',
  parameters: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'Your reply to the user, in character, no markdown.' },
      picks: {
        type: 'array',
        description:
          'Movies to show the user. Every movie_id must come from a search_movies result earlier this ' +
          'turn. Leave empty if nothing fits or the request was out of scope.',
        items: {
          type: 'object',
          properties: {
            movie_id: { type: 'number' },
            reason: { type: 'string', description: 'One short sentence on why this fits them.' }
          },
          required: ['movie_id', 'reason']
        }
      }
    },
    required: ['message', 'picks']
  }
}

let genreMapPromise = null
function genreNameToId() {
  if (!genreMapPromise) {
    genreMapPromise = tmdbFetch('/genre/movie/list').then((data) =>
      Object.fromEntries((data.genres || []).map((g) => [g.name.toLowerCase(), g.id]))
    )
  }
  return genreMapPromise
}

async function executeSearchMovies(args = {}) {
  const { query, genres, keyword_ids: keywordIds, min_rating: minRating } = args
  let results

  if (query) {
    const data = await tmdbFetch('/search/movie', { query })
    results = data.results || []
  } else {
    const genreMap = await genreNameToId()
    const genreIds = (genres || []).map((g) => genreMap[String(g).toLowerCase()]).filter(Boolean)
    const params = { sort_by: 'popularity.desc', 'vote_count.gte': 50 }
    if (genreIds.length) params.with_genres = genreIds.join(',')
    if (keywordIds?.length) params.with_keywords = keywordIds.join(',')
    if (minRating) params['vote_average.gte'] = minRating
    const data = await tmdbFetch('/discover/movie', params)
    results = data.results || []
  }

  return results
    .filter((m) => m.title && m.release_date)
    .slice(0, 8)
    .map((m) => ({
      id: m.id,
      title: m.title,
      year: Number(m.release_date.slice(0, 4)),
      overview: m.overview || ''
    }))
}

function buildSystemInstruction(taste) {
  const keywordLine = taste.topKeywords.length
    ? taste.topKeywords.map((k) => `${k.name} (id ${k.id})`).join(', ')
    : 'no strong signal yet, they are new here'

  return [
    'You are Flixmate, a friendly movie-recommendation assistant built into the Flixmate app.',
    'Scope: you ONLY help with recommending movies, discussing the user\'s taste/watchlist, and answering ' +
      'movie-related questions (actors, directors, plots, similar films). If the user asks about anything ' +
      'else (coding, homework, general trivia, personal advice, anything unrelated to film), decline in one ' +
      'short in-character sentence, e.g. "That\'s outside what I\'m built for, I\'m just your movie ' +
      'matchmaker, try asking me for a recommendation." Do not answer the off-topic request itself.',
    'Grounding: never invent or recall a movie title from memory. Always call search_movies to find real ' +
      'candidates first, and only ever recommend a movie_id that a search_movies call actually returned ' +
      'earlier in this conversation.',
    `This user's taste profile (TMDb keywords weighted by their watchlist and ratings, strongest first): ` +
      `${keywordLine}. Weave this in naturally when relevant, don't recite it verbatim or call it a ` +
      '"taste profile" or "keywords" out loud.',
    'When you\'re ready to reply, call respond exactly once with your message and, if any, your picks. ' +
      'Keep replies short, warm, and conversational.',
    'Writing style: never use em dashes (—) or en dashes (–) anywhere in your reply. Use periods, commas, ' +
      'or parentheses instead.'
  ].join('\n\n')
}

function toStep(role, text) {
  return { type: role === 'user' ? 'user_input' : 'model_output', content: [{ type: 'text', text }] }
}

/**
 * Runs one user turn to completion: replays prior turns as history, lets the
 * model call search_movies as many times as it needs (grounded in real TMDb
 * results), then reads its final reply off the required respond call.
 */
export async function runChatTurn({ historyRows, taste, userText }) {
  let input = [...historyRows.map((m) => toStep(m.role, m.text)), toStep('user', userText)]
  const candidatesById = new Map()
  const systemInstruction = buildSystemInstruction(taste)

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const interaction = await client.interactions.create({
      model: MODEL,
      input,
      tools: [searchMoviesTool, respondTool],
      system_instruction: systemInstruction
    })

    const steps = interaction.steps || []
    input = [...input, ...steps]

    const calls = steps.filter((s) => s.type === 'function_call')
    const respondCall = calls.find((c) => c.name === 'respond')
    if (respondCall) {
      const picks = (respondCall.arguments.picks || [])
        .map((p) => {
          const candidate = candidatesById.get(p.movie_id)
          return candidate ? { id: candidate.id, title: candidate.title, year: candidate.year, why: p.reason } : null
        })
        .filter(Boolean)
      return { reply: respondCall.arguments.message || interaction.output_text || '', picks }
    }

    if (!calls.length) {
      return { reply: interaction.output_text || 'Hm, I lost my train of thought, try that again?', picks: [] }
    }

    const resultSteps = []
    for (const call of calls) {
      if (call.name !== 'search_movies') continue
      const candidates = await executeSearchMovies(call.arguments)
      candidates.forEach((c) => candidatesById.set(c.id, c))
      resultSteps.push({
        type: 'function_result',
        call_id: call.id,
        name: call.name,
        result: JSON.stringify(candidates)
      })
    }
    input = [...input, ...resultSteps]
  }

  return { reply: "I'm taking too long to think this through, mind rephrasing that?", picks: [] }
}
