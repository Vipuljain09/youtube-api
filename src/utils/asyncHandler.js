const asyncHandler = (func) => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      console.log(error);
      res.status(error.code || 400).json({
        success: false,
        message: error.message,
      });
    }
  };
};

export default asyncHandler;
