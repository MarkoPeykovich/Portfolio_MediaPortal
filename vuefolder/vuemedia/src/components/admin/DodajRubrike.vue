<template>
    <div>
        Ime nove rubrike:
        <div>
            <input type="text" v-model="name">
        </div>

        Id urednika:
        <div>
            <input type="text" v-model="id">
        </div>

        <div>
            <button @click="dodajRubriku" class="send">Dodaj rubriku u bazu</button>
        </div>

        Postojece rubrike:
        <div v-for="rubrika in sveRubrike" :key="rubrika.id">   
            <span>{{rubrika.rubrika_naziv}}</span>      
        </div>

        <hr>

        Postojeci urednici:
        <div v-for="urednik in sviUrednici" :key="urednik.urednik_id">
            <div class="individua">
                <div>
                    id urednika: {{urednik.urednik_id}} 
                </div>
                <div>
                    {{urednik.urednik_ime}} {{urednik.urednik_prezime}} 
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
            sviUrednici: [],
            sveRubrike: [],
            name: "",
            id: ""
        }
    },
    methods: {
        getUrednike() {
            axios.get("http://localhost:3000/urednici", {

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                this.sviUrednici = res.data.data;
            });
        },
        getRubrike() {
            axios.get("http://localhost:3000/rubrike", {

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    return;
                }
                this.sveRubrike = res.data.data;
            });
        },
        dodajRubriku() {
             axios.post("http://localhost:3000/rubrike", {
                 naziv: this.name,
                 urednici_id: this.id
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "Vec postoji rubrika sa tim imenom!") {
                    	alert("Vec postoji rubrika sa tim imenom!");
                }
                if(res.data.data == "ERROR, naziv and urednici are required!") {
                    	alert("Morate uneti i naziv rubrike i id urednika!");
                }
                this.$emit("changeK3");
                this.currentRoute;
            });
        }
    },
    mounted() {
        this.getUrednike();
        this.getRubrike();
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