from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
 
from db_declare import Supplier, Discipline, Base


engine = create_engine('sqlite:///ke.db')
# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine
 
DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object. Any change made against the objects in the
# session won't be persisted into the database until you call
# session.commit(). If you're not happy about the changes, you can
# revert all of them back to the last commit by calling
# session.rollback()
session = DBSession()

new_sup = Supplier(name="test_1", contact="PersonX", location="Amsterdam")
new_sup.discipline.append(Discipline(name="Security"))
new_sup.discipline.append(Discipline(name="Catering"))
session.add(new_sup)

new_sup2 = Supplier(name="test_2", contact="PersonY", location="Rotterdam")
new_sup2.discipline.append(Discipline(name="Support"))
session.add(new_sup2)

new_sup3 = Supplier(name="test_3", contact="PersonZ", location="Utrecht")
new_sup3.discipline.append(Discipline(name="Cleaning"))
new_sup3.discipline.append(Discipline(name="Toilet"))
session.add(new_sup3)

session.commit()
