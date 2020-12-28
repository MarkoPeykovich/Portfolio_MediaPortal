<template>
    <div>
        
        Naziv vesti:
        <div>
            <input type="text" v-model="title">
        </div>

        Id rubrike:
        <div>
            <input type="text" v-model="idrubr">
        </div>

        Id novinara koji je napisao vest:
        <div>
            <input type="text" v-model="idnov">
        </div>
        <br/>
        Text vesti:
        <div>
            <textarea v-model="textvesti"></textarea>
        </div>
        <div>
            <button @click="dodajVest" class="send">Dodaj vest u bazu</button>
        </div>

        <hr>

        Postojece rubrike:
        <div v-for="rubr in rubrike" :key="rubr.id">
            <span>id rubrike: {{rubr.rubrika_id}}, {{rubr.rubrika_naziv}}</span>     
        </div>

        <hr>

        Postojeci novinari:
        <div v-for="nov in novinari" :key="nov.id">
            <div class="individua">
                <div>
                    id novinara: {{nov.novinar_id}} 
                </div>
                <div>
                    ime i prezime: {{nov.novinar_ime}} {{nov.novinar_prezime}} 
                </div>
                <div>
                    godiste: {{nov.novinar_godiste}}
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
            novinari: [],
            rubrike: [],
            title: "",
            idrubr: "",
            idnov: "",
            textvesti: ""
        }
    },
    methods: {
        getNovin() {
            axios.get("http://localhost:3000/novinari", {

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                this.novinari = res.data.data;
            });
        },
        getRubr() {
            axios.get("http://localhost:3000/rubrike", {

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    return;
                }
                this.rubrike = res.data.data;
            });
        },
        dodajVest() {
             axios.post("http://localhost:3000/vesti", {
                 naziv: this.title,
                 rubrika_id: this.idrubr,
                 novinar_id: this.idnov,
                 text: this.textvesti   
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "ERROR, naziv, rubrika_id, novinar_id and text are required!") {
                    	alert("Morate uneti i naziv vesti i id rubrike i id novinara i tekst vesti!");
                }
                if(res.data.data == "Vec postoji vest sa tim nazivom!") {
                    	alert("Vec postoji vest sa tim nazivom!");
                }
                if(res.data.data == "OK") {
                    	alert("Vest je uspesno dodata u bazu.");
                }
                this.$emit("changeK5");
                this.currentRoute;
            });
        }
    },
    mounted() {
        this.getNovin();
        this.getRubr();
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