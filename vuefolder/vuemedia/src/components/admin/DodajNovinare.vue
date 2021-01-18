<template>
    <div>
        Ime novog novinara:
        <div>
            <input type="text" v-model="name">
        </div>

        Prezime novog novinara:
        <div>
            <input type="text" v-model="surname">
        </div>

        Godiste novog novinara:
        <div>
            <input type="text" v-model="year">
        </div>

        <div>
            <button @click="dodajNovinara" class="send">Dodaj novinara u bazu</button>
        </div>

        Postojeci novinari:
        <div v-for="novinar in sviNovinari" :key="novinar.novinar_id">
            <div class="individua">
                <div>
                    id novinara: {{novinar.novinar_id}} 
                </div>
                <div>
                    ime i prezime: {{novinar.novinar_ime}} {{novinar.novinar_prezime}} 
                </div>
                <div>
                    godiste: {{novinar.novinar_godiste}}
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios';

export default {
    data: function() {
        return {
            sviNovinari: [],
            name: "",
            surname: "",
            year: ""
        }
    },
    methods: {
        getNovinare() {
            axios.get("http://localhost:3000/novinari", {//get all the journalists

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                this.sviNovinari = res.data.data;
            });
        },
        dodajNovinara() {
             axios.post("http://localhost:3000/novinari", {//add new journalist
                 ime: this.name,
                 prezime: this.surname,
                 godiste: this.year //birthyear
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "ERROR, ime, prezime and godiste are required!") {//name,surname,birthyear required
                    	alert("Greska, morate uneti i ime i prezime i godiste!");
                }
                this.$emit("changeK1");
                this.currentRoute;
            });
        }
    },
    mounted() {
        this.getNovinare();
    }
}
</script>

<style>
    .individua {
        border: 1px solid black;
    }
    .send {
        margin-bottom: 15px;
    }
</style>
