const ErrorResponse = require('../utils/errorResonse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @ desc     get all reviews
// @ route    GET /api/v1/reviews
// @ route    GET /api/v1/bootcamps/:bootcampId/reviews
// @ access   public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @ desc     get a single review
// @ route    GET /api/v1/reviews/:id
// @ access   public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @ desc     add a single review
// @ route    POST /api/v1/bootcamps/:bootcampid/reviews
// @ access   private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp found with id ${req.params.bootcampId}`, 404));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @ desc     update a single review
// @ route    PUT /api/v1/reviews/:id
// @ access   private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
  }

  // review must belong to user (or user is admin)
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review with id ${req.params.id}`, 401));
  }

  const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: updatedReview
  });
});

// @ desc     delete a single review
// @ route    DELETE /api/v1/reviews/:id
// @ access   private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
  }

  // review must belong to user (or user is admin)
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete review with id ${req.params.id}`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});