const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const pool = require('./configs/dbConfig')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Handle pokemon GET route for all pokemon
app.get('/pokemon/', (req, res) => {
    const query = 'SELECT * FROM pokemon_tb'
    pool.query(query, (err, results, fields) => {
      if (err) {
        const response = { data: null, message: err.message, }
        return res.send(response)
      }
      const pokemons = [...results.rows]
      const response = {
        data: pokemons,
        message: 'All pokemons successfully retrieved.',
      }
      res.send(response)
    })
  })
  
  // Handle pokemon GET route for specific pokemon
  app.get('/pokemon/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT * FROM pokemon_tb WHERE id=${id}`
    pool.query(query, (err, results, fields) => {
      if (err) {
        const response = { data: null, message: err.message, }
        return res.send(response)
      }
  
      const pokemon = results.rows[0]
      const response = {
        data: pokemon.data,
        message: `Pokemon ${pokemon.data.name} successfully retrieved.`,
      }
      res.status(200).send(response)
    })
  })
  
  // Handle pokemon POST route
  app.post('/pokemon/', (req, res) => {
    const { name, tipo, catturato } = req.body
  
    const query = `INSERT INTO pokemon_tb (data) VALUES ('{"name":"${name}","tipo":"${tipo}","catturato":"${catturato}"}')`
    pool.query(query, (err, results, fields) => {
      if (err) {
        const response = { data: null, message: err.message, }
        return res.send(response)
      }
  
      // const { id } = results
      // const pokemon = { id: id, name, tipo,catturato }
      const response = {
        message: `Pokemon ${name} successfully added.`,
      }
      res.status(201).send(response)
    })
  })
  
  // Handle pokemon PUT route
  app.put('/pokemon/:id', (req, res) => {
    const { id } = req.params
    const query = `SELECT * FROM pokemon_tb WHERE id=${id} LIMIT 1`
    pool.query(query, (err, results, fields) => {
      if (err) {
        const response = { data: null, message: err.message, }
        return res.send(response)
      }
  
      const { id, name, tipo, catturato } = { ...results.rows[0], ...req.body }
      const query = `UPDATE pokemon_tb SET data='{"name":"${name}","tipo":"${tipo}","catturato":"${catturato}"}' WHERE id='${id}'`
      pool.query(query, (err, results, fields) => {
        if (err) {
          const response = { data: null, message: err.message, }
          res.send(response)
        }
  
        const pokemon = {
          id,
          name,
          tipo,
          catturato
        }
        const response = {
          data: pokemon,
          message: `Pokemon ${name} is successfully updated.`,
        }
        res.send(response)
      })
    })
  })
  
  // Handler pokemon DELETE route
  app.delete('/pokemon/:id', (req, res) => {
    const { id } = req.params
    const query = `DELETE FROM pokemon_tb WHERE id=${id}`
    pool.query(query, (err, results, fields) => {
      if (err) {
        const response = { data: null, message: err.message }
        return res.send(response)
      }
  
      const response = {
        data: null,
        message: `Pokemon with id: ${id} successfully deleted.`,
      }
      res.send(response)
    })
  })
  
  app.get('/pokemon/xtipo/:tipo',(req,res) =>{
    const {tipo} = req.params
    const query = `SELECT * FROM pokemon_tb WHERE data->>'tipo'='${tipo}' `
    pool.query(query,(err,results,fields) => {
      if(err){
        const response = {data:null,message:err.message}
        return res.send(response)
      }
      const response = {
        data: results.rows,
        message: `Pokemon(s) of type ${tipo} succesfully fetched`
      }
      res.send(response)
    })
  })

  app.get('/pokemon/all/catturati',(req,res) =>{
    
    const query = `SELECT * FROM pokemon_tb WHERE (data->>'catturato')::boolean = true `
    pool.query(query,(err,results,fields) => {
      if(err){
        const response = {data:null,message:err.message}
        return res.send(response)
      }
      const response = {
        data: results.rows,
        message: `Owned Pokemon(s) succesfully fetched`
      }
      res.send(response)
    })
  })

  // Handle in-valid route
  app.all('*', function(req, res) {
    const response = { data: null, message: 'Route not found!!' }
    res.status(400).send(response)
  })
  
  // wrap express app instance with serverless http function
  module.exports.handler = serverless(app)