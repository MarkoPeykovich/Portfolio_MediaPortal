<template>
    <div>
        Id rubrike:
        <div>
            <input type="text" v-model="idrubrike">
        </div>

        Id urednika:
        <div>
            <input type="text" v-model="idurednika">
        </div>

        <div>
            <button @click="poveziUrednikaIRubriku" class="send">Povezi urednika i rubriku</button>
        </div>

        Rubrike bez urednika:
        <div v-for="rubrika in sveRubrikeBez" :key="rubrika.id">
                    id rubrike: {{rubrika.rubrika_id}}, naziv: {{rubrika.rubrika_naziv}}
        </div>

        <hr>

        Postojeci urednici:
        <div v-for="urednik in sviUrednici" :key="urednik.id">
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
            sveRubrikeBez: [],
            idrubrike: "",
            idurednika: ""
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
        getRubrikeBez() {
            axios.get("http://localhost:3000/ured_rubr", {

            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    return;
                }
                this.sveRubrikeBez = res.data.data;
            });
        },
        poveziUrednikaIRubriku() {
             axios.post("http://localhost:3000/ured_rubr", {
                 ured_id: this.idurednika,
                 rubr_id: this.idrubrike
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "ERROR, id urednika and id rubrike are required!") {
                    	alert("Greska, morate uneti i id urednika i id rubrike!");
                }
                if(res.data.data == "Rubrika vec ima urednika!") {
                    	alert("Pogresan id rubrike! Ta rubrika vec ima urednika!");
                }
                this.$emit("changeK4");
                this.currentRoute;
            });
        }
    },
    mounted() {
        this.getUrednike();
        this.getRubrikeBez();
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