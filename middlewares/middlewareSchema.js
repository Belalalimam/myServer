const {body} = require('express-validator')

const validationSchema = () => {
    return[
        body("fullname")
      .notEmpty()
      .withMessage("error")
      .isLength({ min: 2 })
      .withMessage("2"),

    body("age")
      .notEmpty()
      .withMessage("error")
      .isLength({ min: 2 })
      .withMessage("2"),
    ]
}

module.exports= {validationSchema}