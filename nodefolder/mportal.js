var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var session = require('express-session');
var cors = require('cors');
require('dotenv').config();

var node_env = process.env.NODE_ENV;
var sess_name = process.env.SESS_NAME;
var sess_secret = process.env.SESS_SECRET;
var sess_lifetime = process.env.SESS_LIFETIME | 0;

const IN_PROD = node_env === 'production';

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "medija_portal",
	multipleStatements: true
});

con.connect(function(err) {
	if(err) throw err;
	console.log("Connected to DB!");
});

var app = express();
var port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
		extended: true
	})
);

app.use((req,res,next) => {
	res.append('Access-Control-Allow-Origin', "http://localhost:8080" /*["null"]*/); //["null"] used if app is started via "HTML strane" (without Vue.js)
	res.append('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS');
	res.append('Access-Control-Allow-Headers','Content-Type');
	res.header("Access-Control-Allow-Headers", 'Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers');
	res.header('Access-Control-Allow-Credentials', true);
	next();
});
  
app.use(session({
	name: sess_name, 
	resave: true,
	saveUninitialized: true,
	secret: sess_secret,
	cookie: {
		maxAge: sess_lifetime, 
                sameSite: "none", // za sada (development faza) // for now (development phase)
		secure: IN_PROD
	}
}));

//The lines of the code below (63-85) are used only if one wants to start this application via folder -->
//"HTML strane" in this project, i.e. to use MediaPortal App without Vue.js
		
app.use(express.static(__dirname + '/HTML strane'));

app.get("/home", function(req,res) { 
	if(req.session.user) {			
		res.sendFile(__dirname + '/HTML strane/komentari_dodaj.html');
	    }
	else{
		res.json({
				data: "req.session.user is empty!"
			})
	}
});

app.get("/admin_panel", function(req,res) { 
	if(req.session.user) {			
		res.sendFile(__dirname + '/HTML strane/admin_panel.html');
	    }
	else{
		res.json({
				data: "req.session.user is empty!"
			})
	}
});	

app.post("/login", function(req,res) {
	var username = req.body.username;
	var password = req.body.password;
	var user; 
	
	con.query("SELECT pretplatnik_id, pretplatnik_username, pretplatnik_password FROM pretplatnici", 
		function(err,result,field) {// pretplatnik_id = subscriber_id...
		if(err) throw err;	
			for(var i = 0; i<result.length; i++) {
				if(username === result[i].pretplatnik_username) {
					user = JSON.parse(JSON.stringify(result[i]));
					break;
				}
			}			
		});
				
	con.query("SELECT * FROM pretplatnici WHERE pretplatnik_username=? AND pretplatnik_password=?", 
	[username,password], async function(err,result,field) {// pretplatnici = subscribers
				
	if(err) throw err;
			
	if(user == null) {
		res.json({
				data: "Nema korisnika pod tim imenom!"// data: "There is no user with such an username!"
			})
		}
		try{
		    if(await bcrypt.compare(password,user.pretplatnik_password)){
				req.session.user = user;
				req.session.user_id = user.pretplatnik_id;
				var name = req.session.user.pretplatnik_username;
			        //These few lines of code below (120-125) should be used instead of 126-131 if one wants -->
				//to start this application via folder "HTML strane" without Vue.js
				/*if(name == "admin" && req.session.user_id) {
					res.redirect("/admin_panel");
				}	
				if(name != "admin" && req.session.user_id) {
					res.redirect("/home");							
				}*/
				if(req.session.user_id) {
					res.json({
						data: name,
						msg: "OK!"   
					})
				}
			    	else{
					next();
				     }
				}
				else{
					res.json({
						  data: "Pogresna sifra!"// data: "Wrong password!"
					     })
				}
			}catch {
				return res.status(500).send();
			} 
		});
	});
	
app.post("/register", async function(req,res) {
	try {
		var salt = await bcrypt.genSalt();
		var username = req.body.username;
		var password = req.body.password;
		var hashedPassword = await bcrypt.hash(password, salt);
		
		if(username == "" || password == "") {
			res.json({
					data: "ERROR, username and password are required!"
				})
				return;
		}
		
		con.query("SELECT * FROM pretplatnici WHERE pretplatnik_username=?", 
		[username], function(err,result,field) {//pretplatnici = subscribers
			if(err) throw err;
			if(result.length>0) {
				res.json({
					data: "ERROR, Invalid credentials! Vec postoji taj username!"
				})
				return;
			}
			
			con.query("INSERT INTO pretplatnici (pretplatnik_username, pretplatnik_password, pretplatnik_level) VALUES (?,?,?)", 
			[username, hashedPassword, 2], function(err,result,field) {
				if(err) throw err;
				
				con.query("UPDATE pretplatnici SET pretplatnik_level=1 WHERE pretplatnik_id=1", function(err,result,field) {
					if(err) throw err;
				});
				
				res.json({
					data: "User created successfully"
				})
			});
		});
	}
	catch{
		res.status(500).send(); 
	}
});

app.get("/pretplatnici", function(req,res) {//get all subscribers from the table "subscribers" in database
					    //pretplatnici = subscribers
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"// data: "You must be logged in!"
				})
				return;
			}
	
	con.query("SELECT * FROM pretplatnici", function(err,result,field) {
		if(err) throw err;
		if(result.length>0) {
			res.json({
				data: result
			})
		}
	});
});

app.post("/pretplatnici_delete", function(req,res) {//delete subscribers from the "subscribers" table in database
		var pretpl_id = req.body.pretpl_id;//pretpl_id = subscriber_id
	
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"// data: "You must be logged in!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise pretplatnike!"// data: "Only admin is entitled to delete subscribers!"
				})
				return;
			}
			
		con.query("DELETE from komentari WHERE pretplatnici_pretplatnik_id=?", [pretpl_id], function(err,result,field) {
			if(err) throw err;//delete from the "comments" table in database on the basis of subscriber_id
		});	
		});	
			
		con.query("DELETE from pretplatnici WHERE pretplatnik_id=?", [pretpl_id], function(err,result,field) {
			if(err) throw err;//delete from "subscribers" table in database on the basis of subscriber_id
			res.json({
					data: "OK. Pretplatnik je izbrisan!"// data: "OK. The subscriber is deleted!"
				})
		});
});	

app.get("/rubrike", function(req,res) {//get all sections/rubrics from the table "rubrics" in database 
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"// data: "You must be logged in!"
				})
				return;
			}
			
		con.query("SELECT * FROM rubrike", function(err,result,field) {
			if(err) throw err;
			if(result.length>0) {
				res.json({
					data: result
				})
			}
	    });
    });

app.post("/rubrike", function(req,res) {//insert new sections/rubrics into the table "rubrics" 
		var naziv = req.body.naziv;// naziv = name of new rubric
		var urednici = req.body.urednici_id;// urednici = editors of new rubric
		var rubrika_id;// rubrika_id = section_id (rubric_id)
	
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"// data: "You must be logged in!"
				})
				return;
			} 
			
		if(naziv == "" || urednici == "") {
			res.json({
					data: "ERROR, naziv and urednici are required!"// name and editors are required
				})
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje rubrike!"//data: "Only admin is entitled to delete rubrics!"
				})
				return;
			}
			
		con.query("SELECT * FROM rubrike", function(err,result,field) {
		if(err) throw err;
		
		for(var i = 0; i<result.length; i++) {
			if(naziv == result[i].rubrika_naziv) {
				res.json({
						data: "Vec postoji rubrika sa tim imenom!"// data: The rubric with such a name already exists!
					})
				return;
			}
		}
		
		con.query("INSERT INTO rubrike SET rubrika_naziv=?", [naziv], function(err,result,field) {
		if(err) throw err;//we first insert a new rubric_name into the table "rubrics"
			res.json({
				data: "OK"
			})
		});
		
		con.query("SELECT rubrika_id FROM rubrike WHERE rubrika_naziv=?", [naziv], function(err,result,field) {
			for(var i=0; i<result.length; i++) {//then we select rubric_id that corresponds to the rubric_name
				rubrika_id = result[i].rubrika_id;
			}
	
			var urednici_niz = urednici.split(",");//form an array of editors urednici_niz[] for the case -->
							       //if two or more editors are entered
			
			for(var i = 0; i<urednici_niz.length; i++) {		
				con.query("INSERT INTO ured_rubr SET urednici_urednik_id=?, rubrike_rubrika_id=?", 
				[urednici_niz[i], rubrika_id], function(err,result,field) {
					if(err) throw err;//finally, we insert editor_id and rubric_id into composite primary key -->
							  //table "editors_rubrics"
				});
			}
		});	
	});
});

app.post("/rubrike_delete", function(req,res) {//delete the chosen rubric
		var rubrika_id = req.body.rubrika_id;//rubrika_id = rubric_id

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"// data: "You must be logged in!"
				})
				return;
			}
			
		if(rubrika_id == "") {
			res.json({
					data: "Greska, morate uneti id rubrike"// data: "Error, you must enter rubric_id"
				})
				return;
		}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise rubrike!"//data: "Only admin is entitled to delete rubrics!"
				})
				return;
			}
			
		con.query("DELETE from ured_rubr WHERE rubrike_rubrika_id=?", [rubrika_id], function(err,result,field) {
			if(err) throw err;//firstly, we delete rubric_id from composite primary key table editors_rubrics
		});	
		
		con.query("SELECT * from vesti WHERE rubrike_rubrika_id=?", [rubrika_id], function(err,result,field) {
			if(err) throw err;//then, select all the news (vesti) which have this rubric_id (belong to this rubric)
			var vestiId = [];//and put these news in the array vestiId[]
			if(result.length > 0) {
				for(var i = 0; i<result.length; i++) {
					vestiId.push(result[i].vest_id)
				}
			}
			
			for(var i = 0; i<vestiId.length; i++) {
				con.query("DELETE from vest_novin WHERE vesti_vest_id=?", [vestiId[i]], function(err,result,field) {
					if(err) throw err;//delete news_id and journalist_id from composite primary key table --> 
					                  //"news_journalist" which have one of the ids from this array vestiId[]
				});
				
				con.query("DELETE from komentari WHERE vesti_vest_id=?", [vestiId[i]], function(err,result,field) {
					if(err) throw err;//delete all the comments from the table "comments" which have -->
					                  //one of the ids from this array vestiId[]
				});

				con.query("DELETE from vesti WHERE vest_id=?", [vestiId[i]], function(err,result,field) {
					if(err) throw err;//delete all the news from the table "news" which have -->
					                  //one of the ids from this array vestiId[]
				});
			}
			
			con.query("DELETE from rubrike WHERE rubrika_id=?", [rubrika_id], function(err,result,field) {
			if(err) throw err;//finally, delete the rubric from "rubrics" table on the basis of entered rubric_id
			res.json({
					data: "OK. Rubrika izbrisana!"// data: "OK. The rubric is deleted!"
				})
			});
		});	
});

app.get("/ured_rubr", function(req,res) {//get all the rubrics wtihout respective editors
	var niz = [];//array in which all the rubric_id from composite primary key table "editors_rubrics" will be pushed
	var niz1 = [];//array in which all the rubric_id from table "rubrics" will be pushed
	var niz3 = [];//array in which only those rubric_id that have an editor will be pushed
	var niz4 = [];//array in which all the data about rubrics that have at least one editor will be pushed                        
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"// data: "You must be logged in!"
				})
				return;
			}
	
		con.query("SELECT rubrike_rubrika_id from ured_rubr", function(err,result,field) {
			if(err) throw err;//select rubric_id from composite primary key table "editors_rubrics" and push -->
			for(var i = 0; i<result.length; i++) {//to the first array niz[]
				niz.push(result[i].rubrike_rubrika_id);
			}
	    });
		
		con.query("SELECT rubrika_id from rubrike", function(err,result,field) {
			if(err) throw err;//select rubric_id from table "rubrics"
			for(var i = 0; i<result.length; i++) {
				niz1.push(result[i].rubrika_id);//push it into the array niz1[]
			}
			for(var i = 0; i<niz1.length; i++) {//check whether the array of rubrics with editors contains -->
					if(niz.indexOf(niz1[i]) == -1) {//the respective rubric, push the rubric_id into third array -->
						niz3.push(niz1[i]);//niz3[] if it doesn't contain it (if the rubric doesn't have at least one editor)
					}
			}		
	    });	
		
		con.query("SELECT * FROM rubrike", function(err,result,field) {//select all the data from table "rubrics"
			if(err) throw err;
			for(var i = 0; i<result.length; i++) {
				for(var j = 0; j<niz3.length; j++) {
					if(result[i].rubrika_id == niz3[j]) {//if the rubric_id matches the rubric_id -->
						niz4.push(result[i]);//inside the third array (where rubrics without editors are) -->
					}                            //push all the data about respective rubric into the fourth array
				}		
			}
			
			res.json({//and send such an array (all data about rubric without editors) as a response to the frontend
				data: niz4
			})
			
	});		
});

app.post("/ured_rubr", function(req,res) {//add new editors for rubrics currently without editors
		var ured_id = req.body.ured_id;//ured_id = editor_id
		var rubr_id = req.body.rubr_id;//rubr_id = rubric_id
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!"
				})
				return;
			} 
			
		if(ured_id == "" || rubr_id == "") {
			res.json({
					data: "ERROR, id urednika and id rubrike are required!"// editor_id and rubric_id are required
				})
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da povezuje urednike i rubrike!"//"Only admin is entitled to combine editors and rubrics!"
				})
				return;
			}
			
		con.query("SELECT rubrike_rubrika_id FROM ured_rubr",  function(err,result,field) {
			for(var i=0; i<result.length; i++) {//select all the rubric_id from the table "editors_rubrics"
				if(rubr_id == result[i].rubrike_rubrika_id) {//check whether the rubric already has an editor
					res.json({
						data: "Rubrika vec ima urednika!"// data: "This rubric already has an editor!"
					})
					return;
				}
			}
		});	
		
		con.query("INSERT INTO ured_rubr SET urednici_urednik_id=?, rubrike_rubrika_id=?", 
				[ured_id, rubr_id], function(err,result,field) {//insert into table "editors_rubrics" -->
					if(err) throw err;                      //the new editor_id and rubric_id
					res.json({
						data: "OK. Rubrika je dobila novog urednika"//data: "OK. This rubric has got a new editor"
					})
				});
    });
	
app.get("/urednici", function(req,res) {//get all the editors
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!"
				})
				return;
			}
		
		con.query("SELECT * FROM urednici", function(err,result,field) {//select all the data from the table "editors"
			if(err) throw err;
			if(result.length>0) {
				res.json({
					data: result
				})
			}
	    });
    });
	
app.post("/urednici", function(req,res) {//add new editors to the database
		var ime = req.body.ime;// ime = editor name 
		var prezime = req.body.prezime;// prezime = editor surname
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!" 
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje urednike!"//"Only admin is entitled to add editors!"
				})
				return;
			}
			
		if(ime == "" || prezime == "") {
			res.json({
					data: "ERROR, ime and prezime are required!"//editor name and surname are required
				})
				return;
		}
			
		con.query("INSERT INTO urednici SET urednik_ime=?, urednik_prezime=?", [ime,prezime], function(err,result,field) {
			if(err) throw err;//insert into table "editors" the newly entered editor name and surname
			res.json({
					data: "OK"
				})
		});	
	});

app.post("/urednici_delete", function(req,res) {//delete a chosen editor on the basis of editor_id
		var ured_id = req.body.ured_id;// ured_id = editor_id

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!" //data: "You must be logged in!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise urednike!"//"Only admin is entitled to delete editors!"
				})
				return;
			}
			
		con.query("DELETE from ured_rubr WHERE urednici_urednik_id=?", [ured_id], function(err,result,field) {
			if(err) throw err;//delete editor_id and rubric_id from -->
		});	                  //the composite primary key table "editors_rubrics" on the basis of enteres editor_id
			
		con.query("DELETE from urednici WHERE urednik_id=?", [ured_id], function(err,result,field) {
			if(err) throw err;//finally, delete all the data from the table "editors" for the respective editor_id
			res.json({
					data: "OK. Urednik izbrisan!"//"OK. The editor is deleted!"
				})
		});
});	
	
app.get("/vesti", function(req,res) {//get all the news (vesti)
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!" 
				})
				return;
			}            
		
		con.query("SELECT * FROM vesti", function(err,result,field) {//select all the data from the table "news"
			if(err) throw err;
			if(result.length>0) {
				res.json({
					data: result
				})
			}
	    });
    });
	
app.get("/vesti_komentari", function(req,res) {//get all the news (vesti) having at least one comment (komentar)
	
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!" //data: "You must be logged in!"                                
				})
				return;
			}
			
		con.query("SELECT * FROM vesti, komentari WHERE vesti.vest_id=komentari.vesti_vest_id", function(err,result,field) {
			if(err) throw err;//select all the news and comment data from the tables "news" and "commentaries" -->  
			if(result.length == 0) {//if the news_id from both tables matches
				res.json({
					data: "Nema nijedne vesti sa komentarom!"//data: "There are no news with at least one comment"
				})
			}
			if(result.length>0) { 
				res.json({
					data: result
				})
			}
	    });
    });	
	
app.post("/vesti", function(req,res) {//add news (vesti) to database
		var naziv = req.body.naziv;//naziv = news headline
		var rubrika_id = req.body.rubrika_id;//rubrika_id = rubric_id
		var novinari = req.body.novinar_id;//novinari = journalist_id
		var text = req.body.text;//text = news text
		var vest_id;
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!"
				})
				return;
			}
			
		if(naziv == "" || rubrika_id == "" || novinari == "" || text == "") {
			res.json({
					data: "ERROR, naziv, rubrika_id, novinar_id and text are required!"
				})      //data: "headline, rubric_id, journalist_id and news text are required"
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje vesti!"//"Only admin is entitled to add news!"
				})
				return;
			}
		
		con.query("SELECT * FROM vesti", function(err,result,field) {//select all the data from the table "news" (vesti)
		if(err) throw err;
		
		for(var i = 0; i<result.length; i++) {
			if(naziv == result[i].vest_naziv) {//check whether the entered news headline (naziv) already exists 
				res.json({                 //in the table "news" (vesti)
						data: "Vec postoji vest sa tim nazivom!"//data: "The news with such a headline аlready exist!"
					})
				return;
			}
		}
		
		con.query("INSERT INTO vesti SET vest_naziv=?, vest_text=?, rubrike_rubrika_id=?", [naziv, text, rubrika_id], function(err,result,field) {
		if(err) throw err;//insert into the table "news" (vesti) the news headline, text, rubric_id
			res.json({
				data: "OK"
			})
		});
		
		con.query("SELECT vest_id FROM vesti WHERE vest_naziv=?", [naziv], function(err,result,field) {
			for(var i=0; i<result.length; i++) {//select news_id from the table "news" (vesti) -->
				vest_id = result[i].vest_id; //on the basis of headline (naziv)
			}

			var novinari_niz = novinari.split(",");//form an array of journalists novinari_niz[] for the case -->
							       //if two or more journalists are entered
			for(var i = 0; i<novinari_niz.length; i++) {		
				con.query("INSERT INTO vest_novin SET novinari_novinar_id=?, vesti_vest_id=?", 
				[novinari_niz[i], vest_id], function(err,result,field) {//insert journalist_id and news_id -->
					if(err) throw err;   //into composite foreign key table "news_journalist" (vest_novin)
				});
			}
		});	
	});
});

app.put("/vesti", function(req, res) {//update the chosen news
	var vest_text = req.body.vest_text;//vest_text = news text
	var vest_id = req.body.vest_id;//vest_id = news_id
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!"  
				})
				return;
			}
			
	if(vest_text == "") {
			res.json({
					data: "ERROR, vest_text is required!"//news_text is required
				})
				return;
		}
		
	if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da apdejtuje vesti!"//"Only admin is entitled to update news!"
				})
				return;
			}
		
	con.query("UPDATE vesti SET vest_text=? WHERE vest_id=?", //update the news on the basis of news_id
	[vest_text, vest_id], function(err,result,field) {
		res.json({
			data: "OK. Vest updated." //"OK. The news are updated."
		});
	});	
});

app.post("/vesti_delete", function(req,res) {//delete the news on the basis of news_id
		var vest_id = req.body.vest_id;// vest_id=news_id

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!" //data: "You must be logged in!" 
				})
				return;
			}
			
		if(vest_id == "") {
			res.json({
					data: "Greska, morate uneti id vesti" // data: "Error, you must enter news_id"
				})
				return;
		}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise vesti!" //"Only admin is entitled to delete news!"
				})
				return;
			}
			
		con.query("DELETE from vest_novin  WHERE vesti_vest_id=?", [vest_id], function(err,result,field) {
			if(err) throw err;//delete news_id and journalist_id from composite foreign key table -->
		});	                  //"news_journalist" (vest_novin) on the basis of news_id
		
		con.query("DELETE from komentari  WHERE vesti_vest_id=?", [vest_id], function(err,result,field) {
			if(err) throw err; //delete all the comments from table "comments" (komentari) which belonged to -->
		});	                   //the news with entered news_id
			
		con.query("DELETE from vesti  WHERE vest_id=?", [vest_id], function(err,result,field) {
			if(err) throw err;//delete all the data from the table "news" (vesti) which belonged -->
			res.json({        //to the news with entered news_id (vest_id)
					data: "OK. Vest izbrisana!" //data: "OK. The news are deleted!"
				})
		});
});
	
app.get("/novinari", function(req,res) {//get all the journalists
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!" //data: "You must be logged in!" 
				})
				return;
			}
	
	con.query("SELECT * FROM novinari", function(err,result,field) {//select all the data from the table "journalists" (novinari)
		if(err) throw err;
		if(result.length>0) {
			res.json({
				data: result
			})
		}
	});
});
	
app.post("/novinari", function(req,res) {//add new journalists
		var ime = req.body.ime;// ime = journalist name
		var prezime = req.body.prezime;// prezime = journalist surname
		var godiste = req.body.godiste;// godiste = journalist birthyear
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!" //data: "You must be logged in!"
				})
				return;
			}
			
		if(ime == "" || prezime == "" || godiste == "") {
			res.json({
					data: "ERROR, ime, prezime and godiste are required!"//journalist name, surname and birthyear required
				})
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje novinare!"//"Only admin is entitled to add journalists!"
				})
				return;
			}
			
		con.query("INSERT INTO novinari SET novinar_ime=?, novinar_prezime=?, novinar_godiste=?", [ime, prezime, godiste], function(err,result,field) {
			if(err) throw err;//insert into the table "journalists" (novinari) all the entered values (name, surname and birthyear)
			res.json({
					data: "OK"
				})
		});	
	});	
	
app.get("/komentari", function(req,res) {//get all the comments
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!"
				})
				return;
			}  
	
	con.query("SELECT * FROM komentari", function(err,result,field) {//select all the data belonging to every comment in the table "comments" (komentari)
		if(err) throw err;
		if(result.length>0) {
			res.json({
				data: result
			})
		}
	});
});
	
app.post("/komentari", function(req,res) {//add new comments
		var text = req.body.text;
		var vest_id = req.body.vest_id;//vest_id = news_id
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"//data: "You must be logged in!"
				})
				return;
			}
			
		if(text == "" || vest_id == "") {
			res.json({
					data: "ERROR, text, and vest_id are required!" //text and news_id are required
				})
				return;
		}
		
		con.query("INSERT INTO komentari SET koment_text=?, vesti_vest_id=?, pretplatnici_pretplatnik_id=?", [text, vest_id, req.session.user_id], function(err,result,field) {
			if(err) throw err;//insert into table "comments" (komentari) text (comment), news_id and req.session.user_id
			res.json({
					data: "OK"
				})
		});
});

app.post("/komentari_delete", function(req,res) {//delete chosen comment
		var kom_id = req.body.kom_id;//kom_id = comment_id

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!" //data: "You must be logged in!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise komentare!" //"Only admin is entitled to delete comments!"
				})
				return;
			}
			
		con.query("DELETE from komentari WHERE koment_id=?", [kom_id], function(err,result,field) {
			if(err) throw err;//delete all the data that belong to the chosen comment -->
			res.json({        //from the table "comments" (komentari) on the basis of comment_id
					data: "OK. Komentar je izbrisan!" //data: "OK. The comment is deleted!"
				})
		});	
});

app.get("/logout", function(req,res) {
		req.session.destroy();
		res.clearCookie(sess_name);
		return res.status(200).send("Izlogovali ste se!"); //"You are logged out!"
    });
	
app.listen(port, function() {
		console.log("Aplikacija radi na portu "+port); //"The application is active on the port..."
	});
     

           












