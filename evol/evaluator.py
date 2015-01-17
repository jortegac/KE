class Evaluator:

	def evaluation(self, individual):
		score = 0
		
		for supplier in individual.suppliers:
			score += self.function(supplier);
		
		self.counter += 1		
		if self.counter == self.max_evals:
			return None

		return score
			
	def function(self, supplier):
		
		tmp_units = supplier.unit_measure / self.visitors
		
		tmp_quality = 0
		if supplier.quality_rating <> None:
			tmp_quality = supplier.quality_rating * self.w_quality
			
		tmp_skill = 0
		if supplier.experience_rating <> None:
			tmp_skill = supplier.experience_rating * self.w_skill
		
		tmp_price = 0
		if supplier.price_rating <> None:
			tmp_price = self.w_price / supplier.price_rating 

		tmp_times_hired = supplier.times_hired * self.w_times_hired		
		
		tmp_distance = 0			
		if supplier.location <> None:
			#tmp_distance =  self.w_distance / self.distances[supplier.location]
			tmp_location = self.distances[supplier.location]
		
			if tmp_location == 0:
				tmp_location = 1
			tmp_distance =  self.w_distance * ( 1 / tmp_location)
		
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
		self.w_distance = 6000
		self.w_times_hired = 5
		self.multiplier = {2 : 5, 1 : 0.3, 0 : 1}
		
		if prefHighQuality:
			self.w_quality *= self.multiplier[prefHighQuality]
		if prefHighSkill:
			self.w_skill *= self.multiplier[prefHighSkill]
		if prefHighPrice:
			self.w_price *= self.multiplier[prefHighPrice]