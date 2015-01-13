import os
import sys
sys.path.insert(0, './extra')
from flask import Flask, render_template, url_for, request, jsonify, Response, json
from StringIO import StringIO
from db_declare import Supplier, Base, Discipline
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import requests
import sqlite3
import json
import urllib2 as urllib
import logging
import oauth2 as oauth

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
    
# REST Endpoint wrapper for the runQuery function
@app.route('/sparql', methods=['GET'])
def sparql():
    # app.logger.debug('You arrived at ' + url_for('sparql'))
    # app.logger.debug('I received the following arguments' + str(request.args) )
	
    query = request.args.get('query', None)    
    return_format = request.args.get('format','JSON')
    
    return runQuery(query, return_format)
	
# Get a distinct list of all the available disciplines
@app.route('/disciplines', methods=['GET'])
def disciplines():
    cols = ['name']
    query = session.query(Discipline.name).distinct()
    disciplines = [{col: getattr(d, col) for col in cols} for d in query]    
    return jsonify(disciplines=disciplines)
		    
if __name__ == '__main__':    
    app.run(debug=True)
