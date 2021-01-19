<template>
    <div>
         Id vesti za brisanje:
        <div>
            <input type="text" v-model="vstid">
        </div>

        <div class="inpt">
            <button @click="obrisiVest" class="send">Obrisi vest</button>
        </div>

        Spisak svih vesti:
        <div class="pretraga">
            <input type="text" v-model="searchVe" placeholder="Pretrazi vesti za brisanje"/>
        </div>
        <!--div v-for="vt in vsti" :key="vt.id"-->
        <div v-for="vt in filteredVesti" :key="vt.id">
            <div class="vst">
                <div>
                    id: {{vt.vest_id}}
                </div> 
                <div> 
                    {{vt.vest_naziv}} 
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
            vsti: [],
            vstid: "",
            searchVe: ""
        }
    },
    methods: {
        getVesti() {
            axios.get("http://localhost:3000/vesti", {//get all the news

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                this.vsti = res.data.data;
            });
        },
        obrisiVest() {
             axios.post("http://localhost:3000/vesti_delete", {//delete chosen news
                 vest_id: this.vstid
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "OK. Vest izbrisana!") {//"OK. The news is deleted!"
                    alert("OK. Vest izbrisana!");
                }
                this.$emit("changeK10");
                this.currentRoute;
            });
        }
    },
    computed: {
        filteredVesti: function() {
        return this.vsti.filter((vest) => {
            return vest.vest_naziv.match(this.searchVe);
        })
      }
    },
    mounted() {
        this.getVesti();
    }
}
</script>

<style>
    .vst {
         border: 1px solid black; 
    }
    .inpt {
        margin-bottom: 5px;
    }
    .pretraga {
        margin-bottom: 5px;
        margin-top: 5px;
    }
</style>
