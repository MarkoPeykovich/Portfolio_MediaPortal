<template>
    <div>
        <div class="src">
                <input type="text" v-model="searchV" placeholder="Pretrazi vesti za update"/>
            </div>
        <!--div v-for="v in sveVesti" :key="v.id"-->
        <div v-for="v in filtered" :key="v.id">
            <div class="one">
                <div>
                    id: {{v.vest_id}} 
                </div>
                <div>
                    Naziv vesti: {{v.vest_naziv}}
                </div>
                <div>
                    Objavljeno: {{v.vest_datum | moment("dddd, MMMM Do YYYY, h:mm:ss a")}}
                </div>
                <div>
                    "{{v.vest_text}}"
                </div>
                <button class="update">Apdejtuj vest</button>
                <div class="area" hidden>
                    <textarea v-model="update" class="tarea" hidden></textarea>
                    <button @click="sendUpdate(v.vest_id)" class="bttn" hidden>Posalji update vesti</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios';
import $ from 'jquery';
axios.defaults.withCredentials=true;

export default {
    data: function() {
        return {
            sveVesti: [],
            update: "",
            searchV: ""
        }
    },
    methods: {
        getVesti() {
            axios.get("http://localhost:3000/vesti", {

          }).then((res) => {
            if(res.data.data == "Morate se ulogovati!") {
                this.$store.commit('doLogout');
                this.$router.replace('/');
                return;
            }
              this.sveVesti = res.data.data;
          });
        },
        sendUpdate(id) {
            axios.put("http://localhost:3000/vesti", {
                vest_text: this.update,
                vest_id: id
            }, {withCredentials: true}).then((res) => {
               if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
               }
               if(res.data.data == "ERROR, vest_text is required!") {
                   alert("Morate uneti apdejtovan text vesti!");
               }
               if(res.data.data == "OK. Vest updated.") {
                   alert("Ok. Vest je apdejtovana.");
               }
               this.$emit("changeK6");
               this.currentRoute;
            });
        }
    },
    computed: {
        filtered: function() {
        return this.sveVesti.filter((vest) => {
            return vest.vest_naziv.match(this.searchV);
        })
      }
    },
    mounted() {
        this.getVesti();

        $(document).on("click", ".update", function() {
       
        $(this).next().removeAttr("hidden");
        $(this).next().children(".tarea").removeAttr("hidden");
        $(this).next().children(".bttn").removeAttr("hidden");
        $(this).attr("hidden",true);
        
        //$('.update').not($(this)).removeAttr("hidden");
        $('.area').not($(this).next()).attr("hidden",true);
        $('.tarea').not( $(this).next().children()).attr("hidden",true);
        $('.bttn').not($(this).next().children()).attr("hidden",true);
        
      });

      $(document).on("click", ".bttn", function() {
        
        $(this).attr("hidden");
        $(this).prev().attr("hidden");
        $(this).parent().attr("hidden");
        $(this).parent().prev("update").removeAttr("hidden");
        
      });
    }
}
</script>

<style>
    .one {
         border: 1px solid black;
    }
    .update {
        margin-top: 5px;
    }
    .area {
        border: 1px solid black;
        margin-bottom: 10px;
    }
    .tarea {
        width: 400px;
        height: 100px;
    }
    .bttn {
        margin: auto;
    }
    .src {
        margin-top: 10px;
        margin-bottom: 15px;
    }
</style>