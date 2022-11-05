<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome @{{ $store.state.username }}</h2>
      </header>
      <CreateFreetForm />
    </section>
    <section v-else>
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to create, edit, and delete freets.
        </h3>
        <h3>
          <router-link to="/">
            Back
          </router-link>
        </h3>
      </article>
    </section>
    <section>
      <header>
        <div class="left">
          <h2>
            Viewing similar Freets
          </h2>
        </div>
      </header>
      <section
        v-if="$store.state.freets.length"
      >
        <SimilarComponent
          v-for="freet in $store.state.freets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No freets found.</h3>
      </article>
    </section>
  </main>
</template>

<script lang="ts">
import SimilarComponent from '@/components/Similar/SimilarComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';



export default {
  name: 'SimilarPage',
  components: {SimilarComponent, CreateFreetForm},

  data() {
    const [similarIdOne, similarIdTwo] = this.$route.params.freetIds.split('*');
    return {
      idOne: similarIdOne,
      idTwo: similarIdTwo,
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  mounted() {
    this.submit();
  },
  methods: {

    async submit() {
      const array = [];
      try
      {
        if (this.idOne === 'undefined') {
          throw new Error('idOne undefined')
        }
        const url = this.idOne ? `/api/freets/${this.idOne}` : '/api/freets';
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        array.push(res)
      }
      catch (e) {
        //
      }
      try{
        if (this.idTwo === 'undefined') {
          throw new Error('idTwo undefined')
        }
        const urlTwo = this.idTwo ? `/api/freets/${this.idTwo}` : '/api/freets';
        const rTwo = await fetch(urlTwo);
        const resTwo = await rTwo.json();
        if (!rTwo.ok) {
          throw new Error(resTwo.error);
        }
        array.push(resTwo)
      }
      catch (e) {
        //
      }
      if (array.length !== 0) {
        this.$store.commit('updateFreets', array);
      }


    }
  
  }
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
