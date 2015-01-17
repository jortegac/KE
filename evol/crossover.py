import random
from individual import Individual

class Crossover:

	def crossover(self, individual1, individual2):
		
		suppliers = []
		
		for i in range(0, len(individual1.suppliers)):
			rand = random.random()
			
			if rand < 0.5:
				suppliers.append(individual1.suppliers[i])
			else:
				suppliers.append(individual2.suppliers[i])
			
		new_ind = Individual(suppliers)
		return new_ind
		