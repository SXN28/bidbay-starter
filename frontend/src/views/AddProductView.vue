<script setup>
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();

if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}

const productName = ref('');
const productDescription = ref('');
const productCategory = ref('');
const productOriginalPrice = ref(0);
const productPictureUrl = ref('');
const productEndDate = ref('');

const errorMessage = ref('');
const isSubmitting = ref(false);

const handleSubmit = async (event) => {
  event.preventDefault();
  errorMessage.value = '';
  isSubmitting.value = true;

  try {

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        name: productName.value,
        description: productDescription.value,
        pictureUrl: productPictureUrl.value,
        category: productCategory.value,
        originalPrice: parseFloat(productOriginalPrice.value),
        endDate: productEndDate.value
      })
    });

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Une erreur s\'est produite lors de la création du produit');
    }

    const productData = await response.json();
    router.push({ name: 'Product', params: { productId: productData.id } });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form @submit="handleSubmit">
        <div v-if="errorMessage" class="alert alert-danger mt-4" role="alert" data-test-error>
          {{ errorMessage }}
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label">Nom du produit *</label>
          <input
            v-model="productName"
            type="text"
            class="form-control"
            id="product-name"
            required
            data-test-product-name
          />
          <div class="form-text" v-if="!productName">Ce champ est requis.</div>
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">Description *</label>
          <textarea
            v-model="productDescription"
            class="form-control"
            id="product-description"
            name="description"
            rows="3"
            required
            data-test-product-description
          ></textarea>
          <div class="form-text" v-if="!productDescription">Ce champ est requis.</div>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label">Catégorie *</label>
          <input
            v-model="productCategory"
            type="text"
            class="form-control"
            id="product-category"
            required
            data-test-product-category
          />
          <div class="form-text" v-if="!productCategory">Ce champ est requis.</div>
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">Prix de départ *</label>
          <div class="input-group">
            <input
              v-model="productOriginalPrice"
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="0.01"
              min="0"
              required
              data-test-product-price
            />
            <span class="input-group-text">€</span>
          </div>
          <div class="form-text" v-if="!productOriginalPrice">Ce champ est requis.</div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">URL de l'image *</label>
          <input
            v-model="productPictureUrl"
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            required
            data-test-product-picture
          />
          <div class="form-text" v-if="!productPictureUrl">Ce champ est requis.</div>
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">Date de fin de l'enchère *</label>
          <input
            v-model="productEndDate"
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            required
            data-test-product-end-date
          />
          <div class="form-text" v-if="!productEndDate">Ce champ est requis.</div>
        </div>

        <div class="d-grid gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
            data-test-submit
          >
            Ajouter le produit
            <span
              v-if="isSubmitting"
              data-test-spinner
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>