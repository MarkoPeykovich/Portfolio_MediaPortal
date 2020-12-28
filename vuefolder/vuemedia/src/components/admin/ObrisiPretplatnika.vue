<template>
    <div>
         Id pretplatnika za brisanje:
        <div>
            <input type="text" v-model="pretplid">
        </div>

        <div class="inp">
            <button @click="obrisiPretplatnika" class="send">Obrisi pretplatnika na osnovu id iz baze</button>
        </div>

        Spisak svih pretplatnika:
        <div class="sh">
            <input type="text" v-model="searchP" placeholder="Pretrazi pretplatnike"/>
        </div>
        <!--div v-for="pr in pretplatnici" :key="pr.id"-->
        <div v-for="pr in filteredP" :key="pr.id">
            <div class="pre">
                <div>
                    id: {{pr.pretplatnik_id}}
                </div> 
                <div> 
                    {{pr.pretplatnik_username}} 
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
            pretplatnici: [],
            pretplid: "",
            searchP: ""
        }
    },
    methods: {
        getPretplatnike() {
            axios.get("http://localhost:3000/pretplatnici", {

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                this.pretplatnici = res.data.data;
            });
        },
        obrisiPretplatnika() {
             axios.post("http://localhost:3000/pretplatnici_delete", {
                 pretpl_id: this.pretplid
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "OK. Pretplatnik je izbrisan!") {
                    alert("OK. Pretplatnik je izbrisan!");
                }
                this.$emit("changeK8");
                this.currentRoute;
            });
        }
    },
    computed: {
        filteredP: function() {
        return this.pretplatnici.filter((pretplatnik) => {
            return pretplatnik.pretplatnik_username.match(this.searchP);
        })
      }
    },
    mounted() {
        this.getPretplatnike();
    }
}
</script>

<style>
    .pre {
         border: 1px solid black; 
    }
    .inp {
        margin-bottom: 5px;
    }
    .sh {
        margin-top: 5px;
        margin-bottom: 5px;
    }
</style>