'use strict';
const Hapi = require('hapi');
const MySQL = require('mysql');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
 
// Create a server with a host and port
const server = new Hapi.Server();
const connection = MySQL.createConnection({
     host: 'localhost',
     user: 'root',
     password: '',
     database: 'node'
});


server.connection({ 
    host: 'localhost', 
    port: 8000 
});

connection.connect();

//  Show users
server.route({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {
       connection.query('SELECT uid, username, email FROM users',
       function (error, results, fields) {
       if (error) throw error;

       reply(results);
    });
  }
});

// show users by ID
server.route({
    method: 'GET',
    path: '/users/{uid}',
    handler: function (request, reply) {
    const uid = request.params.uid;

    connection.query('SELECT uid, username, email FROM users WHERE uid = "' + uid + '"',
    function (error, results, fields) {
       if (error) throw error;
	   reply(results);
    });
  }
});

// Delete users by Id
server.route({
    method: 'DELETE',
    path: '/delete/users/{uid}',
    handler: function (request, reply) {
    const uid = request.params.uid;

    connection.query('DELETE FROM users WHERE uid = "' + uid + '"',
    function (error, results, fields) {
       if (error) throw error;
	if(results.affectedRows == 1){
		results.affectedRows = "Successfully Deleted";
			reply(JSON.stringify('Message :' + results.affectedRows));
	   }else{
		   reply(error);
	   }
    });
  }
});

//update users by ID
server.route({
    method: 'PUT',
    path: '/edit/users/{uid}',
    handler: function (request, reply) {
    const uid = request.params.uid;
	const username = request.payload.username;
    const email = request.payload.email;

	connection.query('UPDATE users SET username ="' + username + '", email ="' + email + '"  WHERE uid = "' + uid + '"',
    function (error, results, fields) {
       if (error) throw error;
	if(results.affectedRows == 1){
			results.affectedRows = "Successfully Updated";
			reply(JSON.stringify('Message :' + results.affectedRows));
	   }else{
		   reply(error);
	   }
    });
  }
});

//  Insert users 
server.route({
    method: 'POST',
    path: '/insertusers',
    handler: function (request, reply) {
	const username = request.payload.username;
    const email = request.payload.email;
	const password = request.payload.password;
	var salt = Bcrypt.genSaltSync();
    var encryptedPassword = Bcrypt.hashSync(password, salt);
	connection.query('INSERT INTO users (username,email,password)Values("' + username + '","' + email + '","' + encryptedPassword + '")',
    function (error, results, fields) {
       if (error) throw error;
	   
	   if(results.affectedRows == 1){
			results.affectedRows = "Successfully Registerd, Thank You!";
			reply(JSON.stringify('UserID :' + results.insertId + ', Message :' + results.affectedRows));
	   }else{
		   reply(error);
	   }
	});
  }
});

// Login 
server.route({
	 method: "POST",
	 path:"/login",
	 handler:function(request,reply){
		 const username = request.payload.username;
		 const password = request.payload.password; 
		 var salt = Bcrypt.genSaltSync();
         var encryptedPassword = Bcrypt.hashSync(password, salt);
		 
 connection.query('SELECT username,password from users where username="' + username + '" AND password="' + encryptedPassword + '"',
 function (error, results, fields) {
      if (error) throw error;
	  if(results!=""){
	  var message = "Successfully Login";
	  var response_data = {'username':results[0].username,'message':message};
	  reply(JSON.stringify(response_data));
	   }
	   //reply(results[0].username);
	 });
   }
});

server.start((err) => {
   if (err) {
     throw err;
   }
  console.log('Server running at:', server.info.uri);
});