class Evaluator:

	def eval(individual):
		score = 0
		
		for supplier in individual.suppliers:
			score += function(supplier);
		
		counter += 1		
		if counter == max_evals:
			return None
		else:
			return score
			
	def function(supplier):
		
		tmp_units = supplier.unit_measure/visitors
		tmp_quality = supplier.quality_rating * w_quality
		tmp_skill = supplier.skill_rating * w_skill
		tmp_price = w_price / supplier.price_rating 
		tmp_distance = 0
		tmp_times_hired = supplier.times_hired * w_times_hired
		
		if supplier.location <> None:
			tmp_distance =  w_distance / distances[supplier.location]
		
		result = tmp_units + tmp_quality + tmp_skill + tmp_price + tmp_distance + tmp_times_hired
	
		return result

	def __init__(self, max_evals, visitors, distances, prefHighQuality, prefHighSkill, prefHighPrice):
		self.max_evals = max_evals
		self.visitors = visitors
		self.counter = 0
		self.distances = distances
		self.w_skill = 8
		self.w_quality = 8
		self.w_price = 7
		self.w_distance = 6
		self.w_times_hired = 5
		self.multiplier = {2 : 1.5, 1 : 0.7, 0 : 1}
		
		if prefHighQuality:
			self.w_quality *= self.multiplier[prefHighQuality]
		if prefHighSkill:
			self.w_skill *= self.multiplier[prefHighSkill]
		if prefHighPrice:
			self.w_price *= self.multiplier[prefHighPrice]