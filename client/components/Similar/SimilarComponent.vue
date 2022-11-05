<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        @{{ freet.author }}
      </h3>
    </header>
    
    <p
      class="content"
    >
      {{ freet.content }}
    </p>

    <p
      v-if="showMore"
      class="content"
    >
      {{ freet.expandContent }}
    </p>
    <p
      v-if="showMore"
      class="content"
    >
      {{ freet.sourceOne }}
    </p>
    <p
      v-if="showMore"
      class="content"
    >
      {{ freet.sourceTwo }}
    </p>
    <p
      v-if="showMore"
      class="content"
    >
      {{ freet.sourceThree }}
    </p>


    <p class="date">
      Posted at {{ freet.dateModified }}
      <i v-if="freet.edited">(edited)</i>
    </p>

    <p align = "right">
      <button
        v-if="!showMore"
        class="showMore"
        @click="showMoreClick"
      >
        Show more...
      </button>

      <button
        v-else
        class="showMore"
        @click="showLess"
      >
        Show less...
      </button>
    </p>

    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>

<script>
export default {
  name: 'FreetComponent',
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showMore: false,
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    showMoreClick() {
      this.showMore = true;
    },
    showLess() {
      this.showMore = false;
    },

    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify(
          {
            content: this.content,
            expandContent: this.expand,
            sourceOne: this.sourceOne,
            sourceTwo: this.sourceTwo,
            sourceThree: this.sourceThree,
          }),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },

    async request(params) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>
<style scoped>
.freet {
    border: solid 25px #998DA0;
    padding: 20px;
    background-color: #A6E1FA;
    color:  #111;
    height: 80%
    
}
.actions {
  cursor: pointer;
}

.showMore{
  display: inline-block;
  background-color: #A6E1FA;
  border-radius: 0px;
  border: 4px double #A6E1FA;
  color: #111;
  cursor: pointer;
  position: relative; bottom:-35px;
}
.date {
        font-size: small;
        position: relative; bottom: -80px;
}

.author {
        font-size: x-large;
}

.content{
  font-size: large;
}

.contentIndent{
  font-size: large;
  text-indent: 5%;
}

.editcontent{
  font-size: medium;
}

.similar a {
  font-size: x-large;
  color: #111;
  font-style: italic;
  position: relative; top: 25px;
}
</style>
