<template>
   <div>
        Ime novog urednika:
        <div>
            <input type="text" v-model="name">
        </div>

        Prezime novog urednika:
        <div>
            <input type="text" v-model="surname">
        </div>

        <div>
            <button @click="dodajUrednika" class="send">Dodaj urednika u bazu</button>
        </div>

        Postojeci urednici:
        <div v-for="urednik in sviUrednici" :key="urednik.urednik_id">
            <div class="urednik">
                <div>
                    id urednika: {{urednik.urednik_id}} 
                </div>
                <div>
                    ime i prezime: {{urednik.urednik_ime}} {{urednik.urednik_prezime}} 
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
            name: "",
            surname: ""
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
                this.sviUrednici = res.data.data;
            });
        },
        dodajUrednika() {
             axios.post("http://localhost:3000/urednici", {//send new editor
                 ime: this.name,
                 prezime: this.surname
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {// "You must be logged in!"
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "ERROR, ime and prezime are required!") {//editor name and surname required
                    	alert("Greska, morate uneti i ime i prezime!");
                }
                this.$emit("changeK2");
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
    .urednik {
        border: 1px solid black;
    }
    .send {
        margin-bottom: 15px;
    }
</style>
