const express = require('express')
// crypto nos ayuda a generar un identificador único universal
const crypto = require('node:crypto')
const cors = require('cors')

const movies = require('./movies.json')
const { validarMovie, validarNombreParcial } = require('./schemas/movies')

// iniciar app de express
const app = express()
// Middelware
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://127.0.0.1:5500',
      'http://localhost:1234',
      'http://movies.com'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by Cors'))
  }
}))
// Deshabilitamos el header x-powered-by
app.disable('x-powered-by')

// Todos los recursos MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  // con express podemos recuperar los parámetros de una consulta fácilmente
  const { genre } = req.query
  if (genre) {
    const movieFiltrada = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(movieFiltrada)
  }
  res.json(movies)
})

// recupera uma movie por su id
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ mensaje: 'Movie no encontrada' })
})

// method POST
app.post('/movies', (req, res) => {
  // Realizamos la validación de los datos
  const result = validarMovie(req.body)
  // En caso de error lo indicamos
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    // generamos el id
    id: crypto.randomUUID(),
    // Ya tenemos todos los datos validados
    ...result.data
  }
  // Esto no es REST porque estámos guardando el estado de la app en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie no encontrada' })
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie eliminada' })
})

// Actualizar una parte de información
app.patch('/movies/:id', (req, res) => {
  const result = validarNombreParcial(req.body)
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ mensaje: 'Movie no encontrada' })
  }

  const updateMovie = {
    // Todo lo que tenemos en moviindex
    ...movies[movieIndex],
    // Todo lo que tenemos en data
    ...result.data
  }
  // Guardamos los datos en el índice
  movies[movieIndex] = updateMovie
  // devolvemos el JSON de la movie actualizada
  return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`servidor escuchando en el puerto http://localhost:${PORT}`)
})
