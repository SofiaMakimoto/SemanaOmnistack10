const Dev = require('../models/Dev');
const parseStringasArray = require('../utils/parseStringasArray');

module.exports = {
    async index(request, response) {
        const { latitude, longitude, techs } = request.query;
        const techsArray = parseStringasArray(techs);

        const devs = await Dev.find({
            techs: {
                $in: techsArray,
            },
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000
                },
            },
        }); 
        return response.json({ devs });
    }
}