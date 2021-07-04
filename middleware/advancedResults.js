const advancedResults = (model, populate) => async (req, res, next) => {
  let query,
        reqQuery = { ...req.query },
        removeFields = ['select', 'sort', 'page', 'limit'];

    // remove fields
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    
    // create operators
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = model.find(JSON.parse(queryStr));

    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }

    const results = await query;

    // Pagination result
    let pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit
      }
    }

    res.advancedResults = {
      success: true,
      count: results.length,
      pagination: pagination,
      data: results,
    }

    next();
}

module.exports = advancedResults;