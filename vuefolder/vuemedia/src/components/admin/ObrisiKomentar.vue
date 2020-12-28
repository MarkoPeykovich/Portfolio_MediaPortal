<template>
    <div>
         Id komentara za brisanje:
        <div>
            <input type="text" v-model="komid">
        </div>

        <div class="inp">
            <button @click="obrisiKomentar" class="send">Obrisi komentar na osnovu id iz baze</button>
        </div>

        Vesti sa vise komentara:
        <div class="sc">
            <input type="text" v-model="searchMK" placeholder="Pretrazi vesti sa vise komentara"/>
        </div>
        <!--div v-for="(vkv,i) in nizIstihId" :key="vkv.id" class="vise1"-->
        <div v-for="(vkv,i) in filterMany" :key="vkv.id" class="vise1">
            <div class="nasl">
                {{i+1}} {{vkv.vest_naziv}}
            </div>
            <div class="tkst">
                "{{vkv.vest_text}}"
            </div>
            <div class="kmn">
                komentari: 
            </div>
            <div v-for="kmv in nizIstihId[i].komentari" :key="kmv.id">
                <div class="km">
                    <div class="idk">
                        id: {{kmv.kom_id}}
                    </div>
                    {{kmv.kom_text}} 
                </div>
            </div>
        </div>

        Vesti sa jednim komentarom:
        <div class="sc">
            <input type="text" v-model="searchOK" placeholder="Pretrazi vesti sa jednim komentara"/>
        </div>
        <!--div v-for="(vkj,i) in nizRaznihId" :key="vkj.id" class="jedan"-->
        <div v-for="(vkj,i) in filterOne" :key="vkj.id" class="jedan">
            <div class="nasl">
                {{i+1}} {{vkj.vest_naziv}}
            </div>
            <div class="tkst">
                "{{vkj.vest_text}}"
            </div>
            <div class="kmn">
                komentar: 
            </div>
            <div class="idk1">
                id: {{vkj.komentar_id}}
            </div>
            <div class="km1">
                {{vkj.komentar}}
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
            nizIstihId: [],
            nizRaznihId: [],
            komid: "",
            searchMK: "",
            searchOK: ""
        }
    },
    methods: {
        getKomentare() {
            axios.get("http://localhost:3000/vesti_komentari", {

            }).then((res) => {

                 if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "Nema nijedne vesti sa komentarom!") {
                    alert("Nema nijedne vesti sa komentarom!");
                    return;
                }

            var niz = res.data.data;
            var double = [];//double je niz od id vesti koje imaju vise komentara

            //ObrisiKomentar.vue prikazuje dve celine: -> 
            //vesti sa vise komentara (nizIstihId[]) i vesti sa jednim komentarom (nizRaznihId[])

            if(niz.length>1) {
            //sortiramo var niz u skladu sa id svih vesti od najmanjeg id ka najvecem id
            niz.sort((a,b) => a.vest_id - b.vest_id);

            for(var i = 0; i<niz.length-1; i++) {
            var nizIJ = [];//nizIJ skuplja sve komentare na datu vest sem prvog komentara
            if(niz[i].vest_id !== niz[i+1].vest_id) {continue;}
            double.push(niz[i].vest_id);
            for(var j = i+1; j<niz.length; j++) {
                if(niz[i].vest_id == niz[j].vest_id) {
                nizIJ.push({"kom_text": niz[j].koment_text, "kom_id": niz[j].koment_id});
                }
            }
            //dodajemo prvi komentar date vesti na [0] od nizIJ
            nizIJ.unshift({"kom_text": niz[i].koment_text, "kom_id": niz[i].koment_id});

            var bool = this.nizIstihId.find(o => o.vest_naziv == niz[i].vest_naziv);
            if(bool == undefined) {
            //ukoliko naziv date vesti vec nije u nizu vesti sa vise komentara (nizIstihId[]), -> 
            //dodaj takvu vest sa id,nazivom, textom vesti i nizom svih njenih komentara (nizIJ) u nizIstihId[]
                    this.nizIstihId.push({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentari": nizIJ});
                }
            }
            
            //ukoliko vest nema id u double[] i razlicita je od ->
            //prve vesti niza (niz[i(=0 zbog break kasnije u petlji)].vest_id), ->
            //tj. ako ima jedan komentar, dodaj je u nizRaznihId[] 
            for(var i = 0; i<niz.length-1; i++) {
                for(var j = i+1; j<niz.length; j++) {
                    if(niz[i].vest_id != niz[j].vest_id) {
                        if(double.indexOf(niz[j].vest_id) == -1) {
                            this.nizRaznihId.push({"vest_naziv": niz[j].vest_naziv, "vest_id": niz[j].vest_id, "vest_text": niz[j].vest_text, "komentar": niz[j].koment_text, "komentar_id": niz[j].koment_id});
                        }
                    }
                }
                if(double.indexOf(niz[i].vest_id) == -1) {//dodaj prvu vest niza u nizRaznihId[], ako nema id u double[]
                    this.nizRaznihId.unshift({"vest_naziv": niz[i].vest_naziv, "vest_id": niz[i].vest_id, "vest_text": niz[i].vest_text, "komentar": niz[i].koment_text, "komentar_id": niz[i].koment_id});
                }
                break;
                }
            }
            if(niz.length==1) {//ako vesti_komentari daju samo jednu vest (niz.length==1), stavi tu vest u nizRaznihId[]
                this.nizRaznihId.push({"vest_naziv": niz[0].vest_naziv, "vest_id": niz[0].vest_id, "vest_text": niz[0].vest_text, "komentar": niz[0].koment_text, "komentar_id": niz[0].koment_id})
            }
        });
        },
        obrisiKomentar() {
             axios.post("http://localhost:3000/komentari_delete", {
                 kom_id: this.komid
            }).then((res) => {
                if(res.data.data == "Morate se ulogovati!") {
                    this.$store.commit('doLogout');
                    this.$router.replace('/');
                    return;
                }
                if(res.data.data == "OK. Komentar je izbrisan!") {
                    alert("OK. Komentar je izbrisan!");
                }
                this.$emit("changeK9");
                this.currentRoute;
            });
        }
    },
    computed: {
        filterMany: function() {
        return this.nizIstihId.filter((vest) => {
            return vest.vest_naziv.match(this.searchMK);
        })
      },
      filterOne: function() {
        return this.nizRaznihId.filter((vest) => {
            return vest.vest_naziv.match(this.searchOK);
        })
      }
    },
    mounted() {
        this.getKomentare();
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
    .vise1 {
        margin-top: 5px;
        border: 3px solid black;
        margin-bottom: 25px;
    }
    .jedan {
        margin-top: 5px;
        border: 3px solid black;
    }
    .tkst {
        margin-top: 10px;
        font-size: 90%;
        border: 1px solid black;
    }
    .kmn {
        margin-top: 10px;
        font-size: 80%;
    }
    .km {
       border: 1px solid black;
       font-size: 80%; 
    }
    .idk {
        margin-top: 3px;
        margin-bottom: 3px;
    }
    .nasl {
        margin-top: 5px;
    }
    .idk1 {
        font-size: 80%; 
    }
    .km1 {
       font-size: 80%;
    }
    .sc {
        margin-bottom: 5px;
        margin-top: 5px;
    }
</style>