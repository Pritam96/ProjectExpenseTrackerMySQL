exports.getUser = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
