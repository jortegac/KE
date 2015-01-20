
import os
import sys
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
 
Base = declarative_base()

class Supplier(Base):
	__tablename__ = 'Supplier'
	
	id = Column(Integer, primary_key=True)
	name = Column(String(250), nullable=False)
	contact = Column(String(250))
	phone = Column(String(250))
	email = Column(String(250))
	url = Column(String(250))
	unit_measure = Column(Integer)
	cost_unit_per_day = Column(Integer)
	discipline = Column(String(250), nullable=False)
	times_hired = Column(Integer)
	location = Column(String(250))
	experience_rating = Column(Integer)
	quality_rating = Column(Integer)
	price_rating = Column(Integer)

# Create an engine that stores data in the local directory's ke.db file.
engine = create_engine('sqlite:///ke.db')
 
# Create all tables in the engine. This is equivalent to "Create Table"
# statements in raw SQL.
Base.metadata.create_all(engine)