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
	res.append('Access-Control-Allow-Origin', "http://localhost:8080" /*["null"]*/);
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
        sameSite: "none", // za sada
		secure: IN_PROD
	}
}));

app.get("/", function(req,res) {
	
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da vidi sve pretplatnike!"
				})
				return;
			}
		
		con.query("SELECT * FROM pretplatnici", function(err,result,field) {
			if(err) throw err;
			if(result.length>0) {
				res.json({
					data: result,
					poruka: "OK!"
				})
			}
	    });
    });

app.post("/login", function(req,res) {
		var username = req.body.username;
		var password = req.body.password;
		var user; 
	
		con.query("SELECT pretplatnik_id, pretplatnik_username, pretplatnik_password FROM pretplatnici", 
				function(err,result,field) {
					if(err) throw err;	
					for(var i = 0; i<result.length; i++) {
						if(username === result[i].pretplatnik_username) {
							user = JSON.parse(JSON.stringify(result[i]));
							break;
						}
					}
					
				});
				
		con.query("SELECT * FROM pretplatnici WHERE pretplatnik_username=? AND pretplatnik_password=?", 
		[username,password], async function(err,result,field) {
				
			if(err) throw err;
			
			if(user == null) {
				res.json({
						data: "Nema korisnika pod tim imenom!"
					})
			}
			try{
				if(await bcrypt.compare(password,user.pretplatnik_password)){
							req.session.user = user;
							req.session.user_id = user.pretplatnik_id;
							var name = req.session.user.pretplatnik_username;
						if(req.session.user_id) {
							res.json({
								data: name,
								msg: "OK!"   
							})
						}else{
							next();
						}
					}
				else{
					res.json({
							data: "Pogresna sifra!"
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
		[username], function(err,result,field) {
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

app.get("/pretplatnici", function(req,res) {
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
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

app.post("/pretplatnici_delete", function(req,res) {
		var pretpl_id = req.body.pretpl_id;
	
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise pretplatnike!"
				})
				return;
			}
			
		con.query("DELETE from komentari WHERE pretplatnici_pretplatnik_id=?", [pretpl_id], function(err,result,field) {
			if(err) throw err;
		});	
			
		con.query("DELETE from pretplatnici WHERE pretplatnik_id=?", [pretpl_id], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK. Pretplatnik je izbrisan!"
				})
		});
});	

app.get("/rubrike", function(req,res) {
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
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

app.post("/rubrike", function(req,res) {
		var naziv = req.body.naziv;
		var urednici = req.body.urednici_id;
		var rubrika_id;
	
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			} 
			
		if(naziv == "" || urednici == "") {
			res.json({
					data: "ERROR, naziv and urednici are required!"
				})
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje rubrike!"
				})
				return;
			}
			
		con.query("SELECT * FROM rubrike", function(err,result,field) {
		if(err) throw err;
		
		for(var i = 0; i<result.length; i++) {
			if(naziv == result[i].rubrika_naziv) {
				res.json({
						data: "Vec postoji rubrika sa tim imenom!"
					})
				return;
			}
		}
		
		con.query("INSERT INTO rubrike SET rubrika_naziv=?", [naziv], function(err,result,field) {
		if(err) throw err;
			res.json({
				data: "OK"
			})
		});
		
		con.query("SELECT rubrika_id FROM rubrike WHERE rubrika_naziv=?", [naziv], function(err,result,field) {
			for(var i=0; i<result.length; i++) {
				rubrika_id = result[i].rubrika_id;
			}
	
			var urednici_niz = urednici.split(",");
			
			for(var i = 0; i<urednici_niz.length; i++) {		
				con.query("INSERT INTO ured_rubr SET urednici_urednik_id=?, rubrike_rubrika_id=?", 
				[urednici_niz[i], rubrika_id], function(err,result,field) {
					if(err) throw err;
				});
			}
		});	
	});
});

app.post("/rubrike_delete", function(req,res) {
		var rubrika_id = req.body.rubrika_id;

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(rubrika_id == "") {
			res.json({
					data: "Greska, morate uneti id rubrike"
				})
				return;
		}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise rubrike!"
				})
				return;
			}
			
		con.query("DELETE from ured_rubr WHERE rubrike_rubrika_id=?", [rubrika_id], function(err,result,field) {
			if(err) throw err;
		});	
		
		con.query("SELECT * from vesti WHERE rubrike_rubrika_id=?", [rubrika_id], function(err,result,field) {
			if(err) throw err;
			var vestiId = [];
			if(result.length > 0) {
				for(var i = 0; i<result.length; i++) {
					vestiId.push(result[i].vest_id)
				}
			}
			
			for(var i = 0; i<vestiId.length; i++) {
				con.query("DELETE from vest_novin WHERE vesti_vest_id=?", [vestiId[i]], function(err,result,field) {
					if(err) throw err;
				});
				
				con.query("DELETE from komentari WHERE vesti_vest_id=?", [vestiId[i]], function(err,result,field) {
					if(err) throw err;
				});

				con.query("DELETE from vesti WHERE vest_id=?", [vestiId[i]], function(err,result,field) {
					if(err) throw err;
				});
			}
			
			con.query("DELETE from rubrike WHERE rubrika_id=?", [rubrika_id], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK. Rubrika izbrisana!"
				})
			});
		});	
});

app.get("/ured_rubr", function(req,res) {
	var niz = [];
	var niz1 = [];
	var niz3 = [];
	var niz4 = [];                       
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
	
		con.query("SELECT rubrike_rubrika_id from ured_rubr", function(err,result,field) {
			if(err) throw err;
			for(var i = 0; i<result.length; i++) {
				niz.push(result[i].rubrike_rubrika_id);
			}
	    });
		
		con.query("SELECT rubrika_id from rubrike", function(err,result,field) {
			if(err) throw err;
			for(var i = 0; i<result.length; i++) {
				niz1.push(result[i].rubrika_id);
			}
			for(var i = 0; i<niz1.length; i++) {
					if(niz.indexOf(niz1[i]) == -1) {
						niz3.push(niz1[i]);
					}
			}		
	    });	
		
		con.query("SELECT * FROM rubrike", function(err,result,field) {
			if(err) throw err;
			for(var i = 0; i<result.length; i++) {
				for(var j = 0; j<niz3.length; j++) {
					if(result[i].rubrika_id == niz3[j]) {
						niz4.push(result[i]);
					}
				}		
			}
			
			res.json({
				data: niz4
			})
			
	});		
});

app.post("/ured_rubr", function(req,res) {
		var ured_id = req.body.ured_id;
		var rubr_id = req.body.rubr_id;
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			} 
			
		if(ured_id == "" || rubr_id == "") {
			res.json({
					data: "ERROR, id urednika and id rubrike are required!"
				})
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da povezuje urednike i rubrike!"
				})
				return;
			}
			
		con.query("SELECT rubrike_rubrika_id FROM ured_rubr",  function(err,result,field) {
			for(var i=0; i<result.length; i++) {
				if(rubr_id == result[i].rubrike_rubrika_id) {
					res.json({
						data: "Rubrika vec ima urednika!"
					})
					return;
				}
			}
		});	
		
		con.query("INSERT INTO ured_rubr SET urednici_urednik_id=?, rubrike_rubrika_id=?", 
				[ured_id, rubr_id], function(err,result,field) {
					if(err) throw err;
					res.json({
						data: "OK. Rubrika je dobila novog urednika"
					})
				});
    });
	
app.get("/urednici", function(req,res) {
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
		
		con.query("SELECT * FROM urednici", function(err,result,field) {
			if(err) throw err;
			if(result.length>0) {
				res.json({
					data: result
				})
			}
	    });
    });
	
app.post("/urednici", function(req,res) {
		var ime = req.body.ime;
		var prezime = req.body.prezime;
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje urednike!"
				})
				return;
			}
			
		if(ime == "" || prezime == "") {
			res.json({
					data: "ERROR, ime and prezime are required!"
				})
				return;
		}
			
		con.query("INSERT INTO urednici SET urednik_ime=?, urednik_prezime=?", [ime,prezime], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK"
				})
		});	
	});

app.post("/urednici_delete", function(req,res) {
		var ured_id = req.body.ured_id;

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise urednike!"
				})
				return;
			}
			
		con.query("DELETE from ured_rubr WHERE urednici_urednik_id=?", [ured_id], function(err,result,field) {
			if(err) throw err;
		});	
			
		con.query("DELETE from urednici WHERE urednik_id=?", [ured_id], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK. Urednik izbrisan!"
				})
		});
});	
	
app.get("/vesti", function(req,res) {
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}            
		
		con.query("SELECT * FROM vesti", function(err,result,field) {
			if(err) throw err;
			if(result.length>0) {
				res.json({
					data: result
				})
			}
	    });
    });
	
app.get("/vesti_komentari", function(req,res) {
	
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"                                 
				})
				return;
			}
			
		con.query("SELECT * FROM vesti, komentari WHERE vesti.vest_id=komentari.vesti_vest_id", function(err,result,field) {
			if(err) throw err;
			if(result.length == 0) {
				res.json({
					data: "Nema nijedne vesti sa komentarom!"
				})
			}
			if(result.length>0) { 
				res.json({
					data: result
				})
			}
	    });
    });	
	
app.post("/vesti", function(req,res) {
		var naziv = req.body.naziv;
		var rubrika_id = req.body.rubrika_id;
		var novinari = req.body.novinar_id;
		var text = req.body.text;
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(naziv == "" || rubrika_id == "" || novinari == "" || text == "") {
			res.json({
					data: "ERROR, naziv, rubrika_id, novinar_id and text are required!"
				})
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje vesti!"
				})
				return;
			}
		
		con.query("SELECT * FROM vesti", function(err,result,field) {
		if(err) throw err;
		
		for(var i = 0; i<result.length; i++) {
			if(naziv == result[i].vest_naziv) {
				res.json({
						data: "Vec postoji vest sa tim nazivom!"
					})
				return;
			}
		}
		
		con.query("INSERT INTO vesti SET vest_naziv=?, vest_text=?, rubrike_rubrika_id=?", [naziv, text, rubrika_id], function(err,result,field) {
		if(err) throw err;
			res.json({
				data: "OK"
			})
		});
		
		con.query("SELECT vest_id FROM vesti WHERE vest_naziv=?", [naziv], function(err,result,field) {
			for(var i=0; i<result.length; i++) {
				vest_id = result[i].vest_id;
			}

			var novinari_niz = novinari.split(",");
			
			for(var i = 0; i<novinari_niz.length; i++) {		
				con.query("INSERT INTO vest_novin SET novinari_novinar_id=?, vesti_vest_id=?", 
				[novinari_niz[i], vest_id], function(err,result,field) {
					if(err) throw err;
				});
			}
		});	
	});
});

app.put("/vesti", function(req, res) {
	var vest_text = req.body.vest_text;
	var vest_id = req.body.vest_id;
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
	if(vest_text == "") {
			res.json({
					data: "ERROR, vest_text is required!"
				})
				return;
		}
		
	if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da apdejtuje vesti!"
				})
				return;
			}
		
	con.query("UPDATE vesti SET vest_text=? WHERE vest_id=?", 
	[vest_text, vest_id], function(err,result,field) {
		res.json({
			data: "OK. Vest updated."
		});
	});	
});

app.post("/vesti_delete", function(req,res) {
		var vest_id = req.body.vest_id;

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(vest_id == "") {
			res.json({
					data: "Greska, morate uneti id vesti"
				})
				return;
		}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise vesti!"
				})
				return;
			}
			
		con.query("DELETE from vest_novin  WHERE vesti_vest_id=?", [vest_id], function(err,result,field) {
			if(err) throw err;
		});	
		
		con.query("DELETE from komentari  WHERE vesti_vest_id=?", [vest_id], function(err,result,field) {
			if(err) throw err;
		});	
			
		con.query("DELETE from vesti  WHERE vest_id=?", [vest_id], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK. Vest izbrisana!"
				})
		});
});
	
app.get("/novinari", function(req,res) {
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
	
	con.query("SELECT * FROM novinari", function(err,result,field) {
		if(err) throw err;
		if(result.length>0) {
			res.json({
				data: result
			})
		}
	});
});
	
app.post("/novinari", function(req,res) {
		var ime = req.body.ime;
		var prezime = req.body.prezime;
		var godiste = req.body.godiste;
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(ime == "" || prezime == "" || godiste == "") {
			res.json({
					data: "ERROR, ime, prezime and godiste are required!"
				})
				return;
		}
		
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da dodaje novinare!"
				})
				return;
			}
			
		con.query("INSERT INTO novinari SET novinar_ime=?, novinar_prezime=?, novinar_godiste=?", [ime, prezime, godiste], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK"
				})
		});	
	});	
	
app.get("/komentari", function(req,res) {
	
	if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}  
	
	con.query("SELECT * FROM komentari", function(err,result,field) {
		if(err) throw err;
		if(result.length>0) {
			res.json({
				data: result
			})
		}
	});
});
	
app.post("/komentari", function(req,res) {
		var text = req.body.text;
		var vest_id = req.body.vest_id;
		
		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(text == "" || vest_id == "") {
			res.json({
					data: "ERROR, text, and vest_id are required!"
				})
				return;
		}
		
		con.query("INSERT INTO komentari SET koment_text=?, vesti_vest_id=?, pretplatnici_pretplatnik_id=?", [text, vest_id, req.session.user_id], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK"
				})
		});
});

app.post("/komentari_delete", function(req,res) {
		var kom_id = req.body.kom_id;

		if(!req.session.user) {
				res.json({
					data: "Morate se ulogovati!"
				})
				return;
			}
			
		if(req.session.user_id != 1) {
				res.json({
					data: "Samo admin moze da brise komentare!"
				})
				return;
			}
			
		con.query("DELETE from komentari WHERE koment_id=?", [kom_id], function(err,result,field) {
			if(err) throw err;
			res.json({
					data: "OK. Komentar je izbrisan!"
				})
		});	
});

app.get("/logout", function(req,res) {
		req.session.destroy();
		res.clearCookie(sess_name);
		return res.status(200).send("Izlogovali ste se!");
    });
	
app.listen(port, function() {
		console.log("Aplikacija radi na portu "+port);
	});
     

           












