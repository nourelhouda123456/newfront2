 <template>
  <div class="auth-page">
    <div class="auth-card card">

      <!-- Logo -->
      <div class="auth-logo">
        <img
          src="../assets/logo.png"
          alt="TaskFlow"
          class="auth-logo-img"
        />
        <span class="auth-logo-text">askFlow</span>
      </div>

      <h1 class="auth-title">Créer un compte</h1>
      <p class="auth-sub">
        Compte utilisateur — gérez vos tâches publiques et privées.
      </p>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Nom -->
      <div class="form-group">
        <label>Nom complet</label>
        <input
          v-model="name"
          type="text"
          placeholder="Nom complet"
        />
      </div>

      <!-- Email -->
      <div class="form-group">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="vous@exemple.com"
        />
      </div>

      <!-- Mot de passe -->
      <div class="form-group">
        <label>Mot de passe</label>
        <input
          v-model="password"
          type="password"
          placeholder="Min. 6 caractères"
        />

        <div class="pwd-strength" v-if="password">
          <div
            class="pwd-bar"
            :style="{
              width: pwdStrength.pct + '%',
              background: pwdStrength.color
            }"
          ></div>

          <span :style="{ color: pwdStrength.color }">
            {{ pwdStrength.label }}
          </span>
        </div>
      </div>

      <!-- Confirmation -->
      <div class="form-group">
        <label>Confirmer le mot de passe</label>
        <input
          v-model="confirm"
          type="password"
          @keyup.enter="submit"
        />
      </div>

      <!-- Rôle -->
      <div class="role-info">
        <div class="role-badge">
          👤 Utilisateur
        </div>
      </div>

      <button
        class="btn btn-primary"
        style="width:100%;margin-top:8px"
        @click="submit"
        :disabled="loading"
      >
        {{ loading ? "Création en cours…" : "Créer mon compte" }}
      </button>

      <p class="auth-link">
        Déjà un compte ?
        <router-link to="/login">
          Se connecter
        </router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const auth = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");

const error = ref("");
const loading = ref(false);

const pwdStrength = computed(() => {
  const p = password.value;

  if (!p)
    return {
      pct: 0,
      color: "#ccc",
      label: ""
    };

  let score = 0;

  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  const levels = [
    {
      pct: 20,
      color: "#E24B4A",
      label: "Très faible"
    },
    {
      pct: 40,
      color: "#f59e0b",
      label: "Faible"
    },
    {
      pct: 60,
      color: "#f59e0b",
      label: "Moyen"
    },
    {
      pct: 80,
      color: "#22c55e",
      label: "Fort"
    },
    {
      pct: 100,
      color: "#16a34a",
      label: "Très fort"
    }
  ];

  return levels[Math.min(score, 4)];
});

async function submit() {
  error.value = "";

  if (!name.value || !email.value || !password.value) {
    error.value = "Tous les champs sont obligatoires.";
    return;
  }

  if (password.value.length < 6) {
    error.value =
      "Le mot de passe doit faire au moins 6 caractères.";
    return;
  }

  if (password.value !== confirm.value) {
    error.value =
      "Les mots de passe ne correspondent pas.";
    return;
  }

  loading.value = true;

  const result = await auth.register(
    name.value,
    email.value,
    password.value
  );

  loading.value = false;

  if (!result.ok) {
    error.value = result.error;
    return;
  }

  router.push("/dashboard");
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--gray-1);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 430px;
}

/* ===========================
   LOGO
=========================== */

.auth-logo {
  display: flex;
  align-items: center;      /* Centre verticalement */
  justify-content: center;  /* Centre horizontalement */
  
 }


.auth-logo-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.auth-logo-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--blue);
}

/* ===========================
   TITRES
=========================== */

.auth-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}

.auth-sub {
  text-align: center;
  color: var(--gray-5);
  margin-bottom: 22px;
  font-size: 14px;
}

/* ===========================
   FORM
=========================== */

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
}

/* ===========================
   PASSWORD
=========================== */

.pwd-strength {
  margin-top: 7px;
}

.pwd-bar {
  height: 5px;
  border-radius: 20px;
  transition: .3s;
}

.pwd-strength span {
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
}

/* ===========================
   ROLE
=========================== */

.role-info {
  margin-top: 5px;
  margin-bottom: 10px;
  background: var(--blue-lt);
  border: 1px solid #c7d4fc;
  border-radius: var(--radius);
  padding: 14px;
}

.role-badge {
  color: var(--blue);
  font-weight: 600;
}

/* ===========================
   FOOTER
=========================== */

.auth-link {
  text-align: center;
  margin-top: 18px;
  color: var(--gray-5);
}

.auth-link a {
  color: var(--blue);
  font-weight: 600;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}
</style>