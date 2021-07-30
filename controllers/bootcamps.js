const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResonse');
const getcoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @ desc     get all bootcamps
// @ route    GET /api/v1/bootcamps
// @ access   public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @ desc     get all a bootcamp
// @ route    GET /api/v1/bootcamps/:id
// @ access   public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @ desc     create a bootcamp
// @ route    POST /api/v1/bootcamps
// @ access   private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id});

  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User with id ${req.user.id} has already published a bootcamp`, 400));
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @ desc     update a bootcamp
// @ route    PUT /api/v1/bootcamps/:id
// @ access   private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
  
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    // Authenticate user to update (must own bootcamp)
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User with user id ${req.params.id} is not authorized to update this bootcamp`, 401));
    } 

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({ success: true, data: bootcamp });
});

// @ desc     delete a bootcamp
// @ route    DELETE /api/v1/bootcamps/:id
// @ access   private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
  
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    // Authenticate user to delete (must own bootcamp)
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User with user id ${req.params.id} is not authorized to delete this bootcamp`, 401));
    } 

    bootcamp.remove();
  
    res.status(200).json({ success: true, data: 'successful delete' });
});

// @ desc     get a bootcamp within a raduis
// @ route    DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @ access   private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius using radians
  // Divide distance by radius of earth
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: {
      $centerSphere: [ [ lng, lat], radius ]
    } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
});

// @ desc     upload photo for bootcamp
// @ route    PUT /api/v1/bootcamps/:id/photo
// @ access   private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
  }

  // Authenticate user to update (must own bootcamp)
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User with user id ${req.params.id} is not authorized to update this bootcamp photo`, 401));
  } 

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure that file is photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Uploaded file is not an image file', 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Uploaded file is too large -- must be less than ${process.env.MAX_FILE_UPLOAD} bites`, 400));
  }

  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse('Problem with file upload. Check console log', 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

    res.status(200).json({ success: true, data: file.name });
  })

});