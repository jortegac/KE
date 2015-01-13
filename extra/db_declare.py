
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
	contact = Column(String(250), nullable=False)
	phone = Column(String(250))
	email = Column(String(250))
	discipline = relationship('Discipline', backref='Supplier', lazy='dynamic')
	location = Column(String(250), nullable=False)
	skills_rating = Column(Integer)
	quality_rating = Column(Integer)
	price_rating = Column(Integer)
	
class Discipline(Base):
	__tablename__ = 'Discipline'
	id = Column(Integer, primary_key=True)
	name = Column(String(250), nullable=False)
	supplier_id = Column(Integer, ForeignKey('Supplier.id'))
	
	

# Create an engine that stores data in the local directory's ke.db file.
engine = create_engine('sqlite:///ke.db')
 
# Create all tables in the engine. This is equivalent to "Create Table"
# statements in raw SQL.
Base.metadata.create_all(engine)