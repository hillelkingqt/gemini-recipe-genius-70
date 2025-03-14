
-- Add is_from_community column to recipes table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'recipes'
        AND column_name = 'is_from_community'
    ) THEN
        ALTER TABLE recipes ADD COLUMN is_from_community BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- Add mention_in_title column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'mention_in_title'
    ) THEN
        ALTER TABLE profiles ADD COLUMN mention_in_title BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- Add increment_recipe_likes function if it doesn't exist
CREATE OR REPLACE FUNCTION increment_recipe_likes(recipe_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE recipes
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql;

-- Add decrement_recipe_likes function if it doesn't exist
CREATE OR REPLACE FUNCTION decrement_recipe_likes(recipe_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE recipes
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql;
