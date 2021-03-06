'use strict';

var elasticsearch = require('elasticsearch');

let client = new elasticsearch.Client({
	host:'https://bluemix-sandbox-dal-9-portal.4.dblayer.com:25130',
	httpAuth:'admin:EXWSGQIMZGKOSRPL'
});

module.exports = function(Cat) {

	Cat.observe('after save', function(ctx, next) {
		console.log('after save being run');
		console.log(ctx.instance);

		/*
		this may be overkill, but i remove ID from the body
		*/
		let myId = ctx.instance.id;
		delete ctx.instance.id;

		client.create({
			index:'cat',
			type:'cat',
			body:ctx.instance,
			id:myId
		}).then(function(resp) {
			console.log('ok from es', resp);
			next();
		}, function(err) {
			throw new Error(err);
		});
	});

	Cat.observe('before delete', function(ctx, next) {
		console.log('before delete being run');
		console.log(ctx.where);
		client.delete({
			index:'cat',
			type:'cat',
			id:ctx.where.id
		}).then(function(resp) {
			next();
		}, function(err) {
			throw new Error(err);
		});

	});


	Cat.search = function(text, cb) {
		console.log('passed '+text);
		client.search({index:'cat', type:'cat', q:text}).then(function(resp) {
			console.log(resp.hits);
			let results = [];
			resp.hits.hits.forEach(function(h) {
				results.push(h._source);
			});
			cb(null, results);
			//cb(null, ['d','e']);
		}, function(err) {
			throw new Error(err);
		});
	}

	Cat.remoteMethod('search', {
		accepts: {arg: 'text', type: 'string'},
		returns: {arg: 'results', type: 'array'},
		http:{
			verb:'get'
		}
	});

};

