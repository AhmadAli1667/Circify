import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import moviesRouter from './routes/movies.js'
import peopleRouter from './routes/people.js'
import searchRouter from './routes/search.js'
import trendingRouter from './routes/trending.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/movies', moviesRouter)
app.use('/api/search', searchRouter)
app.use('/api/trending', trendingRouter)
app.use('/api/people', peopleRouter)

app.listen(PORT, () => console.log(`Flixmate backend running on http://localhost:${PORT}`))
