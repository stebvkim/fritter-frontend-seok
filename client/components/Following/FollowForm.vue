<!-- Form for turning NighthawkMode on or off (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'FollowForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users/followers',
      method: 'PUT',
      hasBody: true,
      setUsername: false,
      title: 'Follow user',
      fields: [
        {id: 'user', label: 'Username', value: ''}
      ],
      content: 'Follow:',
      callback: () => {
        this.$router.push({name: 'Home'}); // Goes to Home page after signing out
        this.$store.commit('alert', {
          message: 'Successfully followed user.', status: 'success'
        });
      }
    };
  }
};
</script>
