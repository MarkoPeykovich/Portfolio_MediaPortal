<template>
    <div id="nav">
        
      <router-link to="/" class="home">Home</router-link> |
      <router-link to="/about">About</router-link> | 
      <router-link v-if="this.userName" to="/vesti"> Vesti</router-link> |
      <router-link v-if="this.userName == 'admin'" to="/AdminPanel"> Admin panel</router-link> 
      <!--router-link v-if="rubr" to="/IzabranaRubrika">Izabrana rubrika</router-link-->
      <div v-if="this.userName" class="dugme0">
          <button @click="doLogout">Logout</button>
      </div>
      <div v-if="this.userName =='' && regOpen==false" class="dugme1">
          <button @click="loginOpen = !loginOpen">Login</button>
          <div v-show="loginOpen">
              <table>
                  <tr>
                      <td> Username: </td>
                      <td> <input type="text" v-model="username"> </td>
                  </tr>
                  <tr>
                      <td> Password: </td>
                      <td> <input type="text" v-model="password" style="-webkit-text-security: disc"> </td>
                  </tr>
                  <tr>
                      <td colspan="2"> <button @click="doLogin">Login</button> </td>
                  </tr>
              </table>
          </div>
      </div>

      <div v-if="!this.userName && loginOpen== false" class="dugme1">
          <button @click="regOpen = !regOpen">Register</button>
             <div v-show="regOpen">
              <table>
                  <tr>
                      <td> Username: </td>
                      <td> <input type="text" v-model="usname"> </td>
                  </tr>
                  <tr>
                      <td> Password: </td>
                      <td> <input type="text" v-model="pass" style="-webkit-text-security: disc"> </td>
                  </tr>
                  <tr>
                      <td colspan="2"> <button @click="doRegister">Register</button> </td>
                  </tr>
              </table>
          </div>
      </div>
    </div> 
</template>

<script>
import axios from 'axios';
axios.defaults.withCredentials=true;
import { mapState } from 'vuex';

export default {
    name: "app",
    props: ["rubr", "log"],
    data: function() {
        return {
            loginOpen: false,
            username: "",
            password: "",
            usname: "",
            pass: "",
            regOpen: false          
        }
    },
    computed: mapState({
            userName: state => state.account.userName
        }),
    methods: {
        doRegister() {
            axios.post("http://localhost:3000/register", {
                username: this.usname.trim(),
                password: this.pass
            }).then((res) => {
                if(res.data.data == "User created successfully") {
                    this.regOpen = false;
                    this.usname = "";
                    this.pass = "";
                     alert("Uspesno ste se registrovali! Ulogujte se.");
                }
                 if(res.data.data == "ERROR, Invalid credentials! Vec postoji taj username!") {
                    alert("Takav username vec postoji! Unesite drugaciji!");
                    this.usname = "";
                }
            });
        },
        doLogin() {
            axios.post("http://localhost:3000/login", {
                username: this.username.trim(),
                password: this.password
            }).then((res) => {
                if(res.data.msg == "OK!") {
                    this.loginOpen = false;
                    this.username = "";
                    this.password = "";
                    this.$store.commit('doLogin', res.data.data);
                }
                if(res.data.data == "Nema korisnika pod tim imenom!") {
                     alert("Nema korisnika pod tim imenom! Probajte opet!");
                     this.username = "";
                }
                if(res.data.data == "Pogresna sifra!") {
                     alert("Pogresna sifra! Probajte opet!");
                     this.password = "";
                }
            })
        },
        doLogout() {
            axios.get("http://localhost:3000/logout", {

            }).then((res) => {
                this.$store.commit('doLogout');
                //this.$router.push('/');
                this.loginOpen = false;
                this.username = "";
                this.password = "";
                this.$router.replace('/');
            }).catch((error) => {
                console.log(error)
            });
        }
    }
}
</script>

<style>
    .dugme0 {
        float: right;
        margin-right: 0;
    }
    .dugme1 {
        float: right;
        margin-right: 5px;
    }
</style>