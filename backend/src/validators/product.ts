import Joi from 'joi';

export const validateProduct = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    type: Joi.string().valid('PMS', 'Diesel', 'Kerosene', 'Gas').required(),
    description: Joi.string().required().min(10).max(500),
    price_per_unit: Joi.number().required().min(0),
    available_qty: Joi.number().required().min(0),
    min_order_qty: Joi.number().required().min(1),
    max_order_qty: Joi.number().required().min(1),
    status: Joi.string().valid('available', 'out_of_stock', 'discontinued'),
    specifications: Joi.object({
      octane_rating: Joi.number().min(0).max(100),
      cetane_number: Joi.number().min(0).max(100),
      flash_point: Joi.number().min(0),
      pressure: Joi.number().min(0)
    }).when('type', {
      is: 'PMS',
      then: Joi.object({
        octane_rating: Joi.number().required()
      })
    }).when('type', {
      is: 'Diesel',
      then: Joi.object({
        cetane_number: Joi.number().required()
      })
    }).when('type', {
      is: 'Kerosene',
      then: Joi.object({
        flash_point: Joi.number().required()
      })
    }).when('type', {
      is: 'Gas',
      then: Joi.object({
        pressure: Joi.number().required()
      })
    })
  });

  return schema.validate(data);
}; 