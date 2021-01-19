<template>
    <div>
         Id rubrike za brisanje:
        <div>
            <input type="text" v-model="rubid">
        </div>

        <div class="it">
            <button @click="obrisiRubriku" class="send">Obrisi rubriku</button>
        </div>

        Spisak svih rubrika:
        <div v-for="rbk in rubke" :key="rbk.id">
            <div class="r">
                <div>
                    id: {{rbk.rubrika_id}}
                </div> 
                <div> 
                    {{rbk.rubrika_naziv}} 
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
            rubke: [],
            rubid: ""
        }
    },
    methods: {
        getRubrike() {
            axios.get("http://localhost:3000/rubrike", {//get all the rubrics

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                this.rubke = res.data.data;
            });
        },
        obrisiRubriku() {
            axios.post("http://localhost:3000/rubrike_delete", {//delete chosen rubric
                 rubrika_id: this.rubid   
            }).then((res) => {
                 if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "OK. Rubrika izbrisana!") {//"Ok. The rubric is deleted!"
                    alert("OK. Rubrika izbrisana!");
                }
                this.$emit("changeK11");
                this.currentRoute;
            });
        }
    },
    mounted() {
        this.getRubrike();
    }
}
</script>

<style>
    .r {
         border: 1px solid black; 
    }
    .it {
        margin-bottom: 5px;
    }
</style>
