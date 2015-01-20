class Individual:

	def __init__(self, suppliers):
		self.suppliers = suppliers
		self.score = 0		
		self.total_price = 0	
		
	def calculate_total(self, visitors):
		tmp = 0
		for supplier in self.suppliers:
			tmp += (visitors/supplier.unit_measure) * supplier.cost_unit_per_day
		
		self.total_price = tmp