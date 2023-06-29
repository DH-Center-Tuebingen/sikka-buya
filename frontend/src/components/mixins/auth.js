import Auth from '../../utils/Auth';

export default {
    methods: {
        authenticateIfAvailable: async function () {
            try {
                let user = await Auth.init();
                this.$store.commit('login', user);
            } catch (e) {
                //Fail silently
                console.log('Not authenticated');
            }
        },
        login: async function (email, password) {
            const { message, success, user } = await Auth.login(email, password)

            if (success) {
                this.$store.commit('login', user);
                this.$emit('login');
            }
            return { message, success, user }
        },
        logout: function () {
            Auth.logout()
            this.$store.commit("logout")
            if (this.$route.meta.auth) {
                this.$router.go()
            } else {
                document.location.reload(true)
            }
        }
    }
}