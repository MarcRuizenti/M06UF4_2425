const PORT=7777;
let http = require('http');
let static = require('node-static');
let ws = require('ws');
let file = new static.Server('./public');
 
let http_server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(PORT);


let ws_server = new ws.Server({server: http_server});

let player1, player2;
let viwers = [];

function sendViewers(info) {

	viwers.forEach(function(viewer) {
  	viewer.send(JSON.stringify(info));
	});
}

ws_server.on('connection', function(conn){


	if (player1 == null){
		player1 = conn;
		
		let info = {
			player_num: 1
		};

		player1.send( JSON.stringify(info) );
		

		player1.on('close', function(){
			player1 = null;
			if (player2 != null){
				let data = {dis: 1};

				player2.send(JSON.stringify(data));
			}
		});

		player1.on('message', function (msg){	
			
			if (player2 == null)
				return;
			let info = JSON.parse(msg);
			if (info.y != null){
				player2.send(JSON.stringify(info));
			}
			else if (info.by != null){
				player2.send(JSON.stringify(info));

				viwers.forEach(function(viewer) {
    				viewer.send(JSON.stringify(info));
				});
			}
			else if (info.s1 != null){
					
				player2.send(JSON.stringify(info));

				if (info.s1 >= 3 || info.s2 >= 3){
					
					let data;

					if (info.s1 < info.s2){
						data = {
							game_over: true,
							win: 2 
						};	
					}
					else{
						data = {
							game_over: true,
							win: 1 
						};	
						
					}

					
					player1.send(JSON.stringify(data));
					player2.send(JSON.stringify(data));
				}
			}
		});


	}
	else if (player2 == null){
		
		player2 = conn;
		let info = {
			player_num: 2
		};
	
		player2.send( JSON.stringify(info) );
		setTimeout(function(){
			let data = {game_start: true};

			player1.send(JSON.stringify(data));
			player2.send(JSON.stringify(data));
			sendViewers(data);	
		}, 500);

		player2.on('close', function(){
			player2 = null;

			if (player1 != null){
				data = {dis: 2};

				player1.send(JSON.stringify(data));
			}
		});
		player2.on('message', function (msg){

			if (player1 == null)
				return;
	
			let info = JSON.parse(msg);
			
			if (info.y != null){
				player1.send(JSON.stringify(info));
			}
		});
	}
	else{

		let info ={
			player_num: 3
		};
		conn.send(JSON.stringify(info));
		viwers.push(conn);
		
	}
});
