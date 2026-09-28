/**
 * Reusable request validation middleware.
 * Executes the provided validator function against req.body or req.query.
 * @param {Function} validatorFn - Returns { isValid: boolean, errors: string[] }
 * @param {'body'|'query'|'params'} source - Property to validate
 */
function validate(validatorFn, source = 'body') {
  return (req, res, next) => {
    const data = req[source];
    const { isValid, errors } = validatorFn(data);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please verify your input.',
        errors
      });
    }

    next();
  };
}

module.exports = {
  validate
};
