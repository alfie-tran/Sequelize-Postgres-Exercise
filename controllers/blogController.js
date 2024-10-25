const controller = {};
const models = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

controller.init = async (req, res, next) => {
	res.locals.categories = await models.Category.findAll({
		include: [{ model: models.Blog }],
	});
	res.locals.tags = await models.Tag.findAll();
	next();
};
controller.showList = async (req, res) => {
	let categoryId = isNaN(req.query.categoryId) ? 0 : parseInt(req.query.categoryId);
	let tagId = isNaN(req.query.tagId) ? 0 : parseInt(req.query.tagId);
	let keyword = req.query.keyword ? req.query.keyword.trim() : '';
	let options = {
		include: [{ model: models.Comment }],
		where: {},
	};
	if (categoryId > 0) {
		options.where.categoryId = categoryId;
	}
	if (tagId > 0) {
		options.include.push({
			model: models.Tag,
			where: { id: tagId },
		});
	}
	if (keyword != '') {
		options.where.title = { [Op.iLike]: `%${keyword}%` };
	}

	//phan trang
	let blogs = await models.Blog.findAll(options);
	let limit = 2;
	let page = isNaN(req.query.page) ? 1 : req.query.page;
	let offset = (page - 1) * limit;
	res.locals.blogs = blogs.slice(offset, offset + limit);
	res.locals.pagination = {
		page,
		limit,
		totalRows: blogs.length,
		queryParams: req.query, //phân trang có kèm từ khóa
	};

	res.render('index');
};
controller.showDetails = async (req, res) => {
	let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
	res.locals.blog = await models.Blog.findOne({
		where: { id },
		include: [{ model: models.Category }, { model: models.Tag }, { model: models.User }, { model: models.Comment }],
	});
	res.render('details');
};
module.exports = controller;
