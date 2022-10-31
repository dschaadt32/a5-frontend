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
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button
          v-if="editing"
          @click="submitEdit"
        >
          ✅ Save changes
        </button>
        <button
          v-if="editing"
          @click="stopEditing"
        >
          🚫 Discard changes
        </button>
        <button
          v-if="!editing"
          @click="startEditing"
        >
          ✏️ Edit
        </button>
        <button @click="deleteFreet">
          🗑️ Delete
        </button>

      </div>
    </header>
    <textarea
      v-if="editing"
      class="content"
      :value="draft"
      @input="draft = $event.target.value"
    />
    <textarea
      v-if="editing"
      class="expandContent"
      :value="expandDraft"
      @input="expandDraft = $event.target.value"
    />
    <textarea
      v-if="editing"
      class="sourceOne"
      :value="sourceOneDraft"
      @input="sourceOneDraft = $event.target.value"
    />
    <textarea
      v-if="editing"
      class="sourceTwo"
      :value="sourceTwoDraft"
      @input="sourceTwoDraft = $event.target.value"
    />
    <textarea
      v-if="editing"
      class="sourceThree"
      :value="sourceThreeDraft"
      @input="sourceThreeDraft = $event.target.value"
    />
    <p
      v-else
      class="content"
    >
      {{ freet.content }}
    </p>

    <p
      v-if="showMore"
      class="expand"
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
      class="sourceTwo"
    >
      {{ freet.sourceTwo }}
    </p>
    <p
      v-if="showMore"
      class="sourceThree"
    >
      {{ freet.sourceThree }}
    </p>
  
    <p
      v-if="showMore"
      class="similarOne"
    >
      {{ freet.similarOne }}
    </p>
    <p
      v-if="showMore"
      class="similarTwo"
    >
      {{ freet.similarTwo }}
    </p>

    <p class="info">
      Posted at {{ freet.dateModified }}
      <i v-if="freet.edited">(edited)</i>
    </p>

    <button
    v-if="!showMore"
    @click="showMoreClick"
      >
        Show more...
    </button>

    <button
    v-else
    @click="showLess"
      >
        Show less...
    </button>

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
      editing: false, // Whether or not this freet is in edit mode
      showMore: false,
      draft: this.freet.content, // Potentially-new content for this freet
      expandDraft: this.freet.expandContent,
      sourceOneDraft: this.freet.sourceOne,
      sourceTwoDraft: this.freet.sourceTwo,
      sourceThreeDraft: this.freet.sourceThree,
      alerts: {} // Displays success/error messages encountered during freet modification
    };
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
      this.expandDraft = this.freet.expandContent;
      this.sourceOneDraft = this.freet.sourceOne;
      this.sourceTwoDraft = this.freet.sourceTwo;
      this.sourceThreeDraft = this.freet.sourceThree;
    },
    showMoreClick() {
      this.showMore = true;
    },
    showLess() {
      this.showMore = false;
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
      this.expandDraft = this.freet.expandContent;
      this.sourceOneDraft = this.freet.sourceOne;
      this.sourceTwoDraft = this.freet.sourceTwo;
      this.sourceThreeDraft = this.freet.sourceThree;
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft && this.freet.expandContent === this.expandDraft && this.freet.sourceOne === this.sourceOneDraft && this.freet.sourceTwo === this.sourceTwoDraft && this.freet.sourceThree === this.sourceThreeDraft) {
        const error = 'Error: Edited freet should be different than current freet.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }
      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify(
          {
            content: this.draft,
            expandContent: this.expandDraft,
            sourceOne: this.sourceOneDraft,
            sourceTwo: this.sourceTwoDraft,
            sourceThree: this.sourceThreeDraft
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

        this.editing = false;
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
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
