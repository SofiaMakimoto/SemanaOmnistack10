const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringasArray = require('../utils/parseStringasArray');
const { findConnections, sendMessage } = require  ('../websocket');

module.exports = {
    async index(request, response) {
        const devs = await Dev.find();
        return response.json(devs);
    },


    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body;
        let dev = await Dev.findOne({ github_username });
        if (!dev){
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
            const { name = login, avatar_url, bio } = apiResponse.data;
            const techsArray = parseStringasArray(techs);
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
            const dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location
            });
            //filtrar as conexões que estão há no máx 10 km de distancia
            // e que o novo dev tenha pelo menps uma das techs filtradas
            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray
            )
           sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }
        
        return response.json(dev);
    }
};    