class Evaluator:

	def evaluate(individual):
		score = 0
		
		for supplier in individual.suppliers:
			score = function(supplier);
		
		counter += 1		
		if counter == max_evals:
			return nil
		else:
			return score
			
	def function(supplier):
		return 0
		#return 0.1 supplier.times_hired			
		#supplier.experience_rating
		#supplier.quality_rating
		#supplier.price_rating

	def __init__(self, max_evals):
		self.max_evals = max_evals
		self.counter = 0