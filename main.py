import os
import sys
sys.path.insert(0, './extra')
sys.path.insert(0, './evol')
from flask import Flask, render_template, url_for, request, jsonify, Response, json
from StringIO import StringIO
from db_declare import Supplier, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from individual import Individual
from evaluator import Evaluator
from crossover import Crossover
import requests
import sqlite3
import json
import urllib2 as urllib
import logging
import oauth2 as oauth
import random
from time import sleep

engine = create_engine('sqlite:///extra/ke.db')
Base.metadata.bind = engine
DBSession = sessionmaker()
DBSession.bind = engine
session = DBSession()

app = Flask(__name__)
app.logger.addHandler(logging.FileHandler("app.log"))
			
@app.route('/')
def index():
    return render_template('index.html')
    	
# Get a distinct list of all the available disciplines
@app.route('/disciplines', methods=['GET'])
def disciplines():
    cols = ['discipline']
    query = session.query(Supplier.discipline).distinct()
    disciplines = [{col: getattr(d, col) for col in cols} for d in query]    
    return jsonify(disciplines=disciplines)

# Main function that will create the groups of suppliers that can cover the needs expresses in the parameters
@app.route('/findSuppliers', methods=['GET'])
def findSuppliers():
	disciplines = request.args.getlist('ds')
	if 'date' in request.args:
		date = request.args.get('date')
	location = request.args.get('location')
	budget = request.args.get('budget')
	visitors = int(request.args.get('visitors'))
	skill = request.args.get('skill')
	quality = request.args.get('quality')
	price = request.args.get('price')
	
	supplier_locations = session.query(Supplier.location).filter(Supplier.discipline.in_(disciplines)).filter(Supplier.location <> None).distinct()	
	
	app.logger.info(list(supplier_locations))
	
	distances = {}	
	for loc in supplier_locations:
		try:
			distances.setdefault(loc[0], calculateDistance(location, loc[0]))	
		except IndexError as error:
			app.logger.error(error)
			app.logger.error('Failed to get distance for: ' + loc[0])
			distances.setdefault(loc[0], -1)
		
	
	
	groups_tmp = calculateGroups(disciplines, location, budget, visitors, skill, quality, price, distances)
	
	tmp = {}
	counter = 0
	for group in groups_tmp:
		app.logger.debug(group)
		tmp.setdefault(counter, [])
		for supplier in group.suppliers:
			tmp[counter].append(supplier)
		
		counter += 1
		
	result = {}
	for x in tmp:
		result.setdefault(x, [])
		result[x].append({'total_price' : groups_tmp[x].total_price})
		for supplier in tmp[x]:
			sup = {}
			sup.setdefault('name', supplier.name)
			sup.setdefault('contact', supplier.contact)
			sup.setdefault('email', supplier.email)
			sup.setdefault('url', supplier.url)
			sup.setdefault('unit_measure', supplier.unit_measure)
			sup.setdefault('cost_unit_per_day', supplier.cost_unit_per_day)
			sup.setdefault('discipline', supplier.discipline)
			sup.setdefault('times_hired', supplier.times_hired)
			sup.setdefault('location', supplier.location)
			sup.setdefault('experience_rating', supplier.experience_rating)
			sup.setdefault('quality_rating', supplier.quality_rating)
			sup.setdefault('price_rating', supplier.price_rating)
			result[x].append(sup)
	
	groups = result
	
	return jsonify(groups=groups)
	
def calculateGroups(disciplines, location, budget, visitors, skill, quality, price, distances):
	
	pref = {'High' : 2, 'Low' : 1, 'Indifferent' : 0}
	
	# Get a list of all suppliers
	all_suppliers = session.query(Supplier).filter(Supplier.discipline.in_(disciplines)).all()
	
	# Group suppliers per discipline
	dict_suppliers = {}
	for discipline in disciplines:
		dict_suppliers.setdefault(discipline, [])
	for supplier in all_suppliers:
		dict_suppliers[supplier.discipline].append(supplier)
	
	population = []
	evaluator = Evaluator(1000, visitors, distances, pref[quality], pref[skill], pref[price])
	
	crossover = Crossover()
	
	# Initial population
	for x in range(100):
		candidate_suppliers = []
		for sup_per_discipline in dict_suppliers:
			candidate_suppliers.append(selectRandomSupplier(dict_suppliers, sup_per_discipline))
		individual = Individual(candidate_suppliers)
		
		individual.calculate_total(visitors)
		
		# get score for individual
		score = evaluator.evaluation(individual, budget)
		
		# assign score
		individual.score = score		
		
		# add individual to population
		population.append(individual)
	
	# Sort individuals by fitness
	population.sort(key=lambda x: (x.score), reverse=True)
	
	
	# Evolve
	flag = True	
	while flag:		
		
		# Children
		new_pop = []
		
		# Crossover 20 random individuals to make 10 children
		for x in range(10):
			#ind1 = population[x]
			ind1 = population[random.randint(0, len(population)-1)]
			ind2 = population[random.randint(0, len(population)-1)]
			
			new_ind = crossover.crossover(ind1, ind2)
			
			# Add to children
			new_pop.append(new_ind)
		
		for ind in new_pop:
		
			# Mutate each supplier in each children with a 10% probability
			for supplier in ind.suppliers:
				if (random.random() < 0.2):
					supplier = selectRandomSupplier(dict_suppliers, supplier.discipline)
		
			ind.calculate_total(visitors)
			
			# Evaluate individual
			score = evaluator.evaluation(ind, budget)
			
			if score <> None:
				ind.score = score
			else:
				flag = False
				break;
				
			# Add to population
			population.append(ind)
		
		# Sort descending by score
		population.sort(key=lambda x: (x.score, -x.total_price), reverse=True)
		
		# Keep top 100
		population = population[:100]
	
	# Sort individuals by fitness
	population.sort(key=lambda x: x.score, reverse=True)
	
	for x in range(10):
		app.logger.debug(population[x].score)
	
	# Return top 3
	return population[:3]


	

def calculateDistance(origin, destination):
	
	if origin == destination:
		return 0

	data = requests.get('https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination).json()
	sleep(0.1)
	
	return data['routes'][0]['legs'][0]['distance']['value']

def selectRandomSupplier(suppliers, sup_discipline):
	rand = random.randint(0, len(suppliers[sup_discipline])-1)
	return (suppliers[sup_discipline][rand])
		
if __name__ == '__main__':    
    app.run(host='0.0.0.0')
