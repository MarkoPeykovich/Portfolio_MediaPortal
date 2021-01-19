<template>
    <div>
         Id urednika za brisanje:
        <div>
            <input type="text" v-model="urid">
        </div>

        <div class="input">
            <button @click="obrisiUrednika" class="send">Obrisi urednika na osnovu id iz baze</button>
        </div>

        Spisak svih urednika:
        <div v-for="ur in urednici" :key="ur.id">
            <div class="ure">
                <div>
                    id: {{ur.urednik_id}}
                </div> 
                <div> 
                    {{ur.urednik_ime}} {{ur.urednik_prezime}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
axios.defaults.withCredentials=true;

export default {
    data: function() {
        return {
            urednici: [],
            urid: ""
        }
    },
    methods: {
        getUrednike() {
            axios.get("http://localhost:3000/urednici", {//get all the editors

            }).then((res) => {
                 if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                this.urednici = res.data.data;
            });
        },
        obrisiUrednika() {
             axios.post("http://localhost:3000/urednici_delete", {//delete chosen editor
                 ured_id: this.urid
            }).then((res) => {
                 if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "OK. Urednik izbrisan!") {//"OK. The editor is deleted!"
                    alert("OK. Urednik izbrisan!");
                }
                this.$emit("changeK7");
                this.currentRoute;
            });
        }
    },
    mounted() {
        this.getUrednike();
    }
}
</script>

<style>
    .ure {
         border: 1px solid black; 
    }
    .input {
        margin-bottom: 5px;
    }
</style>
