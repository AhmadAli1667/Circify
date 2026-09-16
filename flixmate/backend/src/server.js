import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import chatRouter from './routes/chat.js'
import cronRouter from './routes/cron.js'
import discoverRouter from './routes/discover.js'
import genresRouter from './routes/genres.js'
import moviesRouter from './routes/movies.js'
import peopleRouter from './routes/people.js'
import ratingsRouter from './routes/ratings.js'
import searchRouter from './routes/search.js'
import trendingRouter from './routes/trending.js'
import watchlistRouter from './routes/watchlist.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map((o) => o.trim())

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/chat', chatRouter)
app.use('/api/cron', cronRouter)
app.use('/api/movies', moviesRouter)
app.use('/api/ratings', ratingsRouter)
app.use('/api/search', searchRouter)
app.use('/api/trending', trendingRouter)
app.use('/api/people', peopleRouter)
app.use('/api/discover', discoverRouter)
app.use('/api/genres', genresRouter)
app.use('/api/watchlist', watchlistRouter)

app.listen(PORT, () => console.log(`Flixmate backend running on http://localhost:${PORT}`))
