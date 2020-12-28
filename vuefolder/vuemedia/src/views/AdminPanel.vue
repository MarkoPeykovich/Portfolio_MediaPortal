<template>
<div>
    <div class="dugmeAdmin">
        <button @click="changeTask('dodaj_nov')" class="prime">Dodaj novinare</button>
            <dodajNovinare v-if="currentTask=='dodaj_nov'" @changeK1="forceRenderer1" :key="compKey1"></dodajNovinare>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('dodaj_ured')" class="prime">Dodaj urednike</button>
        <dodajUrednike v-if="currentTask=='dodaj_ured'" @changeK2="forceRenderer2" :key="compKey2"></dodajUrednike>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('dodaj_rubr')" class="prime">Dodaj rubrike</button>
        <dodajRubrike v-if="currentTask=='dodaj_rubr'" @changeK3="forceRenderer3" :key="compKey3"></dodajRubrike>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('komb_ured_rubr')" class="prime">Rubrike bez urednika</button>
        <kombUredRubr v-if="currentTask=='komb_ured_rubr'" @changeK4="forceRenderer4" :key="compKey4"></kombUredRubr>
    </div>
     <div class="dugmeAdmin">
        <button @click="changeTask('dodaj_vesti')" class="prime">Dodaj vesti</button>
        <dodajVesti v-if="currentTask=='dodaj_vesti'" @changeK5="forceRenderer5" :key="compKey5"></dodajVesti>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('apdejt_vesti')" class="prime">Update vesti</button>
        <apdejtVesti v-if="currentTask=='apdejt_vesti'" @changeK6="forceRenderer6" :key="compKey6"></apdejtVesti>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('obrisi_urednika')" class="prime">Obrisi urednika</button>
        <obrisiUrednika v-if="currentTask=='obrisi_urednika'" @changeK7="forceRenderer7" :key="compKey7"></obrisiUrednika>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('obrisi_pretplatnika')" class="prime">Obrisi pretplatnika</button>
        <obrisiPretplatnika v-if="currentTask=='obrisi_pretplatnika'" @changeK8="forceRenderer8" :key="compKey8"></obrisiPretplatnika>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('obrisi_komentar')" class="prime">Obrisi komentar</button>
        <obrisiKomentar v-if="currentTask=='obrisi_komentar'" @changeK9="forceRenderer9" :key="compKey9"></obrisiKomentar>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('obrisi_vest')" class="prime">Obrisi vest</button>
        <obrisiVesti v-if="currentTask=='obrisi_vest'" @changeK10="forceRenderer10" :key="compKey10"></obrisiVesti>
    </div>
    <div class="dugmeAdmin">
        <button @click="changeTask('obrisi_rubriku')" class="prime">Obrisi rubriku</button>
        <obrisiRubriku v-if="currentTask=='obrisi_rubriku'" @changeK11="forceRenderer11" :key="compKey11"></obrisiRubriku>
    </div>
</div>
</template>

<script>
import DodajNovinare from '../components/admin/DodajNovinare.vue';
import DodajUrednike from '../components/admin/DodajUrednike.vue';
import DodajRubrike from '../components/admin/DodajRubrike.vue';
import KombUredRubr from '../components/admin/KombUredRubr.vue';
import DodajVesti from '../components/admin/DodajVesti.vue';
import ApdejtVesti from '../components/admin/ApdejtVesti.vue';
import ObrisiUrednika from '../components/admin/ObrisiUrednika.vue';
import ObrisiPretplatnika from '../components/admin/ObrisiPretplatnika.vue';
import ObrisiKomentar from '../components/admin/ObrisiKomentar.vue';
import ObrisiVesti from '../components/admin/ObrisiVesti.vue';
import ObrisiRubriku from '../components/admin/ObrisiRubriku.vue';

export default {
    components: {
    'dodajNovinare': DodajNovinare,
    'dodajUrednike': DodajUrednike,
    'dodajRubrike': DodajRubrike,
    'kombUredRubr': KombUredRubr,
    'dodajVesti': DodajVesti,
    'apdejtVesti': ApdejtVesti,
    'obrisiUrednika': ObrisiUrednika,
    'obrisiPretplatnika': ObrisiPretplatnika,
    'obrisiKomentar': ObrisiKomentar,
    'obrisiVesti': ObrisiVesti,
    'obrisiRubriku': ObrisiRubriku
  },
  data: function() {
      return {
          currentTask: "",
          compKey1: 0,
          compKey2: 0,
          compKey3: 0,
          compKey4: 0,
          compKey5: 0,
          compKey6: 0,
          compKey7: 0,
          compKey8: 0,
          compKey9: 0,
          compKey10: 0,
          compKey11: 0
      }
  },
  methods: {
      changeTask (newTask) {
          this.currentTask = newTask;
      },
      forceRenderer1() {
          this.compKey1 += 1;
      },
      forceRenderer2() {
          this.compKey2 += 1;
      },
      forceRenderer3() {
          this.compKey3 += 1;
      },
      forceRenderer4() {
          this.compKey4 += 1;
      },
      forceRenderer5() {
          this.compKey5 += 1;
      },
      forceRenderer6() {
          this.compKey6 += 1;
      },
      forceRenderer7() {
          this.compKey7 += 1;
      },
      forceRenderer8() {
          this.compKey8 += 1;
      },
      forceRenderer9() {
          this.compKey9 += 1;
      },
      forceRenderer10() {
          this.compKey10 += 1;
      },
      forceRenderer11() {
          this.compKey11 += 1;
      }
  }
}
</script>

<style>
    .dugmeAdmin {
        margin: auto;
        margin-bottom: 20px;
        border: 3px solid black;
        background-color: lemonchiffon;
        width: 50%;
    }
    .individua {
        border: 1px solid black;
    }
    .prime {
        margin-bottom: 10px;
    }
</style>