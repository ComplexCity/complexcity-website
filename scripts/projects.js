var culture = 10, mobility = 20, energy = 30, urbanism = 40, health = 50,
	citizen = 1, datascience = 2, government = 3,
	projects = {
		'1': [mobility + datascience, urbanism + government],
		'2' : [health + datascience],
		'3' : [urbanism + citizen, urbanism + government, urbanism + datascience],
		'4' : [mobility + citizen, mobility + government, mobility + datascience, energy + citizen, energy + government, energy + datascience],
		'5' : [mobility + government, mobility + datascience],
		'6' : [health + citizen, health + government, health + datascience],
		'7' : [mobility + government, mobility + datascience],
		'8' : [mobility + citizen, mobility + datascience, urbanism + citizen, urbanism + datascience],
		'9' : [urbanism + citizen, urbanism + government, urbanism + datascience, culture + citizen],
		'10' : [health + datascience, mobility + datascience, energy + datascience, urbanism + datascience, culture + datascience],
		'11' : [mobility + government, energy + government],
		'12' : [culture + citizen, culture + datascience, health + datascience],
		'13' : [energy + citizen, energy + datascience, energy + government, urbanism + citizen],
		'14' : [culture + citizen, culture + datascience, culture + government],
		'15' : [culture + citizen, culture + datascience, culture + government, mobility + citizen, mobility + datascience, mobility + government, energy + citizen, energy + datascience, energy + government, urbanism + citizen, urbanism + datascience, urbanism + government, health + citizen, health + datascience, health + government]
	};
	circles = {
		'11':{'cx':'25%', 'cy':90, 'class':'svg-circle1'},
		'12':{'cx':'25%', 'cy':150, 'class':'svg-circle1'},
		'13':{'cx':'25%', 'cy':210, 'class':'svg-circle1'},
		'21':{'cx':'41%', 'cy':90, 'class':'svg-circle2'},
		'22':{'cx':'41%', 'cy':150, 'class':'svg-circle2'},
		'23':{'cx':'41%', 'cy':210, 'class':'svg-circle2'},
		'31':{'cx':'58%', 'cy':90, 'class':'svg-circle3'},
		'32':{'cx':'58%', 'cy':150, 'class':'svg-circle3'},
		'33':{'cx':'58%', 'cy':210, 'class':'svg-circle3'},
		'41':{'cx':'75%', 'cy':90, 'class':'svg-circle4'},
		'42':{'cx':'75%', 'cy':150, 'class':'svg-circle4'},
		'43':{'cx':'75%', 'cy':210, 'class':'svg-circle4'},
		'51':{'cx':'91%', 'cy':90, 'class':'svg-circle5'},
		'52':{'cx':'91%', 'cy':150, 'class':'svg-circle5'},
		'53':{'cx':'91%', 'cy':210, 'class':'svg-circle5'}
	}

var viz = d3.select('#viz');

function showCircles(i) {
	for (index in projects[i]) {
		var circle = String(projects[i][index]);
		viz.append('circle')
				.attr('id', "c" + circle)
				.attr('cx', circles[circle]['cx'])
				.attr('cy', circles[circle]['cy'])
				.attr('r', 10)
				.attr('class', circles[circle]['class']);
	}
	console.log(viz);
}

function hideCircles(i) {
	for (index in projects[i]) {
		var id = '#c'+ String(projects[i][index]);
		d3.select(id).remove();
	}
}


/*
culture + citizen
culture + datascience
culture + government
mobility + citizen
mobility + datascience
mobility + government
energy + citizen
energy + datascience
energy + government
urbanism + citizen
urbanism + datascience
urbanism + government
health + citizen
health + datascience
health + government
*/