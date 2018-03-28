"use strict";

const Express = require("express")
const AzureAPI = require("./azureAPI.js")
const ACSCluster = require("./ACSCluster.js")
const IMRepository = require("./IMRepository.js")

const clientID = "c1f2a01d-c354-46c4-9d80-5db751f43c1b"
const clientSecret = "YtQrAZ4DhXo6m8ijNAaN00BuNklZR9dp//UoJx9+poI="
const tenantID = "69e52111-6b68-4e8f-b1bc-7b81d1ccbc16"
const subscriptionID = "e35fda75-fea8-4409-a44f-c08a8e066d2b"

const resourceGroupName = "POCGroup3"
const clusterName = "POCACS4"

const api = new AzureAPI(clientID, clientSecret, tenantID, subscriptionID)
const repo = new IMRepository()
const cluster = new ACSCluster(resourceGroupName, clusterName, api, repo)

console.log("Starting server.")

/* TODO: Basic parameter check here. */

cluster.init().then(clusterData => {

    const app = Express()

    app.get("/cs", function (req, res, next) {
        cluster.getCluster().then(result => {
            console.info("get succeeded!")
            //console.dir(result, { depth: null, color: true })
            res.json(result)
            res.end()
        }).catch(err => {
            console.error("get failed")
            console.dir(err, { depth: null, color: true })
            res.status(400)
            res.statusMessage = err.message
            res.json(err)
        })
    })

    app.get("/upd/:count", function (req, res, next) {
        console.log("Update request received.")
        
        let newCount = req.params.count ? parseInt(req.params.count) : 2
        newCount = newCount ? newCount : 2

        cluster.scaleCluster(newCount).then(result => {

            console.info("/upd put succeeded!")
            //console.dir(result, { depth: null, color: true })

            res.json(result)
            res.end()

        }).catch(err => {
            console.error("/upd update failed!")
            console.dir(err.response.data, { depth: null, color: true })
            res.status(400)
            res.statusMessage = err.message
            res.json(err.response.data)
        })
    })

    app.get("/dump", function(req, res, next){
        res.json(repo.dump())
    })

    console.log("Server started")
    app.listen(8085)

}).catch(err => {
    console.error("Server could not start. Error details follow:")
    console.dir(err, { depth: null, color: true })
})



