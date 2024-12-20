// Importamos zod para las validaciones
const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El título debe ser un string',
    required_error: 'El título de movie es requerido'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'La url del poster no es válida'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'El genero de Movie es requerido',
      invalid_type_error: 'El género debe ser un array de string'
    }
  )
})

// eslint-disable-next-line space-before-function-paren
function validarMovie(object) {
  return movieSchema.safeParse(object)
}

// eslint-disable-next-line space-before-function-paren
function validarNombreParcial(object) {
  // Partial hace que todas las propiedades que tenemos en movieSchema sean opcionales
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validarMovie,
  validarNombreParcial
}
